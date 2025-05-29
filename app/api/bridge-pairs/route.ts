import { type NextRequest } from "next/server";

import { chainList } from "@/lib/constants";
import {
  ok,
  badRequest,
  externalError,
  internalError,
} from "@/lib/http-response";
import { OkxClient } from "@/lib/network/okx-client";
import { BridgeTokenPairSchema } from "@/lib/schemas/cross-chain";
import { validateRequest } from "@/lib/validation";
import type { OkxPairsResponse } from "@/types/api/cross-chain";

/* -------------------------------------------------------------------------- */
/*                               Helper fetcher                               */
/* -------------------------------------------------------------------------- */

async function fetchPairsForChain(
  fromChainIndex: string,
): Promise<OkxPairsResponse | null> {
  try {
    const res = await OkxClient.query<OkxPairsResponse>(
      "GET",
      "/api/v5/dex/cross-chain/supported/bridge-tokens-pairs",
      { fromChainIndex },
    );
    if (res.code !== "0") return null;
    return res;
  } catch {
    // Treat unsupported chains or network errors as empty results
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromChainIndex = searchParams.get("fromChainIndex") ?? undefined;

    if (fromChainIndex) {
      try {
        validateRequest({ fromChainIndex }, BridgeTokenPairSchema);
      } catch (e: any) {
        return badRequest(e.message);
      }
    }

    const indices = fromChainIndex
      ? [fromChainIndex]
      : chainList.map((c) => c.index);

    /* ------------------------- fetch all in parallel ------------------------- */
    const results = await Promise.all(
      indices.map((idx) => fetchPairsForChain(idx)),
    );

    /* keep only successful results */
    const successful = results.filter((r): r is OkxPairsResponse => r !== null);

    /* ---------------------- flatten and transform pairs ---------------------- */
    const transformedPairs = successful.flatMap((res) =>
      (res.data ?? []).map((pair) => ({
        fromChainIndex: pair.fromChainIndex,
        toChainIndex: pair.toChainIndex,
        fromChainId: pair.fromChainId,
        toChainId: pair.toChainId,
        fromTokenAddress: pair.fromTokenAddress,
        toTokenAddress: pair.toTokenAddress,
        fromTokenSymbol: pair.fromTokenSymbol,
        toTokenSymbol: pair.toTokenSymbol,
        pairId: `${pair.fromChainIndex}-${pair.toChainIndex}-${pair.fromTokenSymbol}-${pair.toTokenSymbol}`,
      })),
    );

    const pairsByChain = transformedPairs.reduce<
      Record<string, typeof transformedPairs>
    >((acc, p) => {
      const key = `${p.fromChainIndex}-${p.toChainIndex}`;
      acc[key] = acc[key] ? [...acc[key], p] : [p];
      return acc;
    }, {});

    return ok(
      {
        fromChainIndex: fromChainIndex ?? "all",
        totalPairs: transformedPairs.length,
        pairs: transformedPairs,
        pairsByChain,
        upstreamCount: successful.length,
      },
      { fromChainIndex: fromChainIndex ?? "all" },
    );
  } catch (error: any) {
    const message = String(error?.message ?? error);

    if (message.includes("OKX API Error") || message.includes("fetch")) {
      return externalError(message, {
        fromChainIndex:
          new URL(request.url).searchParams.get("fromChainIndex") ?? "unknown",
      });
    }
    return internalError(message, {
      fromChainIndex:
        new URL(request.url).searchParams.get("fromChainIndex") ?? "unknown",
    });
  }
}
