import { type NextRequest } from "next/server";

import {
  ok,
  badRequest,
  externalError,
  internalError,
} from "@/lib/http-response";
import { signedGet } from "@/lib/network/okx-signed";

async function getSupportedTokens(chainIndex: string) {
  return signedGet("/api/v5/dex/aggregator/all-tokens", {
    chainIndex,
    chainId: chainIndex,
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chainIndex = searchParams.get("chainIndex") || "501";

    if (!/^\d+$/.test(chainIndex)) {
      return badRequest("chainIndex must be a numeric string");
    }

    const result = await getSupportedTokens(chainIndex);

    const transformedTokens =
      result.data?.map((token: any) => ({
        symbol: token.tokenSymbol,
        name: token.tokenName,
        address: token.tokenContractAddress,
        decimals: Number.parseInt(token.decimals),
        logoUrl: token.tokenLogoUrl,
        hasLogo: !!token.tokenLogoUrl,
      })) ?? [];

    return ok(
      {
        chainIndex,
        chainName: chainIndex === "501" ? "Solana" : `Chain ${chainIndex}`,
        totalTokens: transformedTokens.length,
        tokens: transformedTokens,
        upstream: result,
      },
      { chainIndex },
    );
  } catch (error: any) {
    const message = String(error?.message ?? error);
    if (message.includes("OKX API Error") || message.includes("fetch")) {
      return externalError(message);
    }
    return internalError(message);
  }
}
