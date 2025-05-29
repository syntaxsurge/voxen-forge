import { type NextRequest } from "next/server";

import {
  ok,
  badRequest,
  externalError,
  internalError,
} from "@/lib/http-response";
import { signedGet } from "@/lib/network/okx-signed";

async function getChainTokens(chainIndex: string) {
  return signedGet("/api/v5/dex/aggregator/all-tokens", {
    chainIndex,
    chainId: chainIndex,
  });
}

async function getCrossChainSupportedTokens(chainIndex?: string) {
  const query = chainIndex ? { chainIndex, chainId: chainIndex } : undefined;
  return signedGet("/api/v5/dex/cross-chain/supported/tokens", query);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chainIndex = searchParams.get("chainIndex") ?? undefined;
    const type = searchParams.get("type") || "chain-tokens";

    if (chainIndex && !/^\d+$/.test(chainIndex)) {
      return badRequest("chainIndex must be a numeric string");
    }

    let result;
    let apiType = "";

    if (type === "cross-chain-supported") {
      result = await getCrossChainSupportedTokens(chainIndex);
      apiType = "Cross-Chain Supported Tokens";
    } else {
      if (!chainIndex) {
        return badRequest("chainIndex is required for chain-tokens type");
      }
      result = await getChainTokens(chainIndex);
      apiType = "Chain Tokens";
    }

    const transformedTokens =
      result.data?.map((token: any) => ({
        symbol: token.tokenSymbol,
        name: token.tokenName,
        address: token.tokenContractAddress,
        decimals: Number.parseInt(token.decimals),
        logoUrl: token.tokenLogoUrl,
        chainIndex: token.chainIndex || chainIndex,
        chainId: token.chainId || chainIndex,
        hasLogo: !!token.tokenLogoUrl,
      })) ?? [];

    return ok(
      {
        type: apiType,
        chainIndex: chainIndex ?? "all",
        totalTokens: transformedTokens.length,
        tokens: transformedTokens,
        upstream: result,
      },
      { chainIndex: chainIndex ?? "all" },
    );
  } catch (error: any) {
    const message = String(error?.message ?? error);
    if (message.includes("OKX API Error") || message.includes("fetch")) {
      return externalError(message);
    }
    return internalError(message);
  }
}
