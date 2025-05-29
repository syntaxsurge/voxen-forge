import { type NextRequest } from "next/server";

import {
  ok,
  badRequest,
  externalError,
  internalError,
} from "@/lib/http-response";
import { OkxClient } from "@/lib/network/okx-client";
import type { OkxBridgeResponse } from "@/types/api/cross-chain";

async function getSupportedBridges(chainIndex?: string) {
  const query = chainIndex ? { chainIndex, chainId: chainIndex } : undefined;
  return OkxClient.query<OkxBridgeResponse>(
    "GET",
    "/api/v5/dex/cross-chain/supported/bridges",
    query,
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chainIndex = searchParams.get("chainIndex") ?? undefined;

    if (chainIndex && !/^\d+$/.test(chainIndex)) {
      return badRequest("Invalid chainIndex; must be numeric");
    }

    const result = await getSupportedBridges(chainIndex);

    const transformedBridges =
      result.data?.map((bridge) => ({
        bridgeId: bridge.bridgeId,
        bridgeName: bridge.bridgeName,
        requireOtherNativeFee:
          bridge.requireOtherNativeFee ??
          bridge.requiredOtherNativeFee ??
          false,
        logoUrl: bridge.logoUrl ?? bridge.logo,
        supportedChains: bridge.supportedChains ?? [],
        supportsSolana: bridge.supportedChains?.includes("501") ?? false,
      })) ?? [];

    const solanaBridges = transformedBridges.filter((b) => b.supportsSolana);

    return ok(
      {
        totalBridges: transformedBridges.length,
        solanaBridges: solanaBridges.length,
        bridges: transformedBridges,
        solanaSupportedBridges: solanaBridges,
        ...result,
      },
      { chainIndex: chainIndex ?? "all" },
    );
  } catch (error: any) {
    const message = String(error?.message ?? error);
    if (message.includes("OKX API Error") || message.includes("fetch")) {
      return externalError(message, {
        chainIndex:
          new URL(request.url).searchParams.get("chainIndex") ?? "all",
      });
    }
    return internalError(message, {
      chainIndex: new URL(request.url).searchParams.get("chainIndex") ?? "all",
    });
  }
}
