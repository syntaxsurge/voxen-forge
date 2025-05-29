"use client";

import { ArrowRightLeft } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { fromRawAmount } from "@/lib/utils";
import type { CrossChainSwapResult, Token } from "@/types/api/cross-chain";

interface Props {
  swapResult: CrossChainSwapResult;
  fromToken: Token | null;
  toToken: Token | null;
}

export default function SwapResultCard({
  swapResult,
  fromToken,
  toToken,
}: Props) {
  if (!swapResult) return null;

  return (
    <Card className="mt-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5" /> Transaction Ready
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {swapResult.data.map((q, i) => (
          <div key={i} className="space-y-2 text-sm text-white">
            <div>
              You send:{" "}
              {fromToken &&
                fromRawAmount(q.fromTokenAmount, fromToken.decimals)}{" "}
              {fromToken?.symbol}
            </div>
            <div>
              You receive:{" "}
              {toToken && fromRawAmount(q.toTokenAmount, toToken.decimals)}{" "}
              {toToken?.symbol}
            </div>
            <div className="text-xs text-white/60">
              Bridge: {q.router.bridgeName} • Min received:{" "}
              {fromRawAmount(q.minmumReceive, toToken!.decimals)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
