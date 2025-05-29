import { type NextRequest } from "next/server";

import {
  ok,
  badRequest,
  externalError,
  internalError,
} from "@/lib/http-response";
import { signedGet } from "@/lib/network/okx-signed";
import { assertRequired, isNumeric } from "@/lib/validation";

/* -------------------------------------------------------------------------- */
/*                               Param checks                                 */
/* -------------------------------------------------------------------------- */

function validateSwapParams(
  params: Record<string, any>,
  requireWallet = false,
): string | null {
  const required = [
    "chainIndex",
    "chainId",
    "fromTokenAddress",
    "toTokenAddress",
    "amount",
    "slippage",
  ];
  if (requireWallet) required.push("userWalletAddress");

  try {
    assertRequired(params, required);
  } catch (e: any) {
    return e.message;
  }

  if (!isNumeric(params.chainIndex))
    return "Invalid chainIndex format. Must be numeric";
  if (!isNumeric(params.chainId))
    return "Invalid chainId format. Must be numeric";
  if (!isNumeric(params.amount))
    return "Invalid amount format. Must be numeric";
  if (!isNumeric(params.slippage))
    return "Invalid slippage format. Must be numeric";

  const slip = parseFloat(params.slippage);
  if (slip < 0 || slip > 100) return "Slippage must be between 0 and 100";
  return null;
}

/* -------------------------------------------------------------------------- */
/*                         Upstream OKX helper calls                          */
/* -------------------------------------------------------------------------- */

async function getSwapQuote(params: Record<string, string>) {
  return signedGet("/api/v5/dex/aggregator/quote", {
    chainIndex: params.chainIndex,
    chainId: params.chainId,
    fromTokenAddress: params.fromTokenAddress,
    toTokenAddress: params.toTokenAddress,
    amount: params.amount,
    slippage: params.slippage,
    ...(params.userWalletAddress
      ? { userWalletAddress: params.userWalletAddress }
      : {}),
  });
}

async function getSwapExecute(params: Record<string, string>) {
  const query: Record<string, string> = {
    chainIndex: params.chainIndex,
    chainId: params.chainId,
    fromTokenAddress: params.fromTokenAddress,
    toTokenAddress: params.toTokenAddress,
    amount: params.amount,
    slippage: params.slippage,
    userWalletAddress: params.userWalletAddress,
    autoSlippage: params.autoSlippage ?? "true",
  };

  if (params.feePercent) query.feePercent = params.feePercent;
  if (params.priceTolerance) query.priceTolerance = params.priceTolerance;
  if (params.pathNum) query.pathNum = params.pathNum;

  return signedGet("/api/v5/dex/aggregator/swap", query);
}

/* -------------------------------------------------------------------------- */
/*                                 Handler                                    */
/* -------------------------------------------------------------------------- */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    if (!["quote", "execute"].includes(action)) {
      return badRequest("Action must be one of: quote, execute");
    }

    const err = validateSwapParams(params, action === "execute");
    if (err) return badRequest(err);

    let result;

    switch (action) {
      case "quote": {
        const q = await getSwapQuote(params);
        if (q.code && q.code !== "0") {
          return badRequest(q.msg || `Quote failed with code ${q.code}`);
        }
        if (!Array.isArray(q.data) || q.data.length === 0) {
          return badRequest("Insufficient liquidity for this pair");
        }
        result = q;
        break;
      }
      case "execute": {
        result = await getSwapExecute(params);
        if (result.code && result.code !== "0") {
          return badRequest(
            result.msg || `Execution failed with code ${result.code}`,
          );
        }
        break;
      }
    }

    return ok({ action, data: result });
  } catch (error: any) {
    const msg = String(error?.message ?? error);
    if (
      msg.startsWith("Missing") ||
      msg.startsWith("Invalid") ||
      msg.includes("Parameter")
    )
      return badRequest(msg);
    if (msg.includes("OKX API Error")) return externalError(msg);
    if (msg.includes("fetch"))
      return externalError("Failed to connect to OKX API");
    return internalError(msg);
  }
}
