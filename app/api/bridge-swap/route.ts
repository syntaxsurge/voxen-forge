import { type NextRequest } from "next/server";

import {
  ok,
  badRequest,
  externalError,
  internalError,
} from "@/lib/http-response";
import { signedGet } from "@/lib/network/okx-signed";
import { CrossChainSwapSchema } from "@/lib/schemas/cross-chain";
import { validateRequest } from "@/lib/validation";
import type { CrossChainSwapParams } from "@/types/api/cross-chain";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...rawParams } = body;

    if (action !== "build-tx") {
      return badRequest("Action must be 'build-tx' for cross-chain swaps");
    }

    const params = validateRequest<CrossChainSwapParams>(
      rawParams,
      CrossChainSwapSchema,
    );

    const query: Record<string, string> = {
      fromChainIndex: params.fromChainIndex,
      toChainIndex: params.toChainIndex,
      fromChainId: params.fromChainId,
      toChainId: params.toChainId,
      fromTokenAddress: params.fromTokenAddress,
      toTokenAddress: params.toTokenAddress,
      amount: params.amount,
      slippage: params.slippage,
      userWalletAddress: params.userWalletAddress,
    };

    if (params.sort) query.sort = params.sort;
    if (params.dexIds) query.dexIds = params.dexIds;
    if (params.receiveAddress) query.receiveAddress = params.receiveAddress;
    if (params.feePercent) query.feePercent = params.feePercent;
    if (params.referrerAddress) query.referrerAddress = params.referrerAddress;
    if (params.priceImpactProtectionPercentage) {
      query.priceImpactProtectionPercentage =
        params.priceImpactProtectionPercentage;
    }
    if (params.onlyBridge !== undefined) {
      query.onlyBridge = String(params.onlyBridge);
    }
    if (params.memo) query.memo = params.memo;
    if (params.allowBridge?.length) {
      query.allowBridge = JSON.stringify(params.allowBridge);
    }
    if (params.denyBridge?.length) {
      query.denyBridge = JSON.stringify(params.denyBridge);
    }

    const data = await signedGet("/api/v5/dex/cross-chain/build-tx", query);

    return ok({ action, data });
  } catch (error: any) {
    const message = String(error?.message ?? error);

    if (
      message.startsWith("Missing") ||
      message.startsWith("Parameter") ||
      message.includes("validation")
    ) {
      return badRequest(message);
    }
    if (message.includes("OKX API Error")) {
      return externalError(message);
    }
    if (message.includes("fetch")) {
      return externalError("Failed to connect to OKX API");
    }
    return internalError(message);
  }
}
