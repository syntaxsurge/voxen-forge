"use client";

import { ArrowRightLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { UseCrossChainSwap } from "@/lib/hooks/use-cross-chain-swap";

import AmountPanel from "./amount-panel";

export default function SwapForm({ swap }: { swap: UseCrossChainSwap }) {
  const {
    fromChain,
    toChain,
    setFromChain,
    setToChain,
    fromTokens,
    toTokens,
    fromToken,
    toToken,
    setFromToken,
    setToToken,
    fromAmount,
    setFromAmount,
    toAmount,
    isLoading,
    loadingFlags,
    walletForChain,
    pairStatus,
    buildTransaction,
  } = swap;

  return (
    <div>
      {/* container */}
      <div className="backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl overflow-hidden">
        {/* FROM */}
        <AmountPanel
          label="From"
          chain={fromChain}
          onChainSelect={(c) => {
            setFromChain(c);
            setFromToken(null);
          }}
          chainDisabled={isLoading}
          tokenList={fromTokens}
          token={fromToken}
          onTokenSelect={setFromToken}
          tokenLoading={loadingFlags.fromTokens}
          amount={fromAmount}
          onAmountChange={setFromAmount}
          walletAddress={walletForChain(fromChain)}
        />

        {/* switch */}
        <div className="flex justify-center -mt-2 -mb-2 relative z-10">
          <Button
            onClick={() => {
              setFromChain(toChain);
              setToChain(fromChain);
              setFromToken(toToken);
              setToToken(fromToken);
            }}
            size="icon"
            className="rounded-full h-10 w-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
          >
            <ArrowRightLeft className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* TO */}
        <AmountPanel
          label="To"
          chain={toChain}
          onChainSelect={(c) => {
            setToChain(c);
            setToToken(null);
          }}
          chainDisabled={isLoading}
          tokenList={toTokens}
          token={toToken}
          onTokenSelect={setToToken}
          tokenLoading={loadingFlags.toTokens}
          amount={toAmount}
          readOnly
          walletAddress={walletForChain(toChain)}
        />
      </div>

      {/* build tx */}
      <Button
        className="w-full mt-6 py-6 text-lg gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white"
        size="lg"
        onClick={buildTransaction}
        disabled={
          isLoading ||
          !fromAmount ||
          parseFloat(fromAmount) <= 0 ||
          !pairStatus.valid
        }
      >
        <ArrowRightLeft className="h-5 w-5" />
        Build Transaction
      </Button>
    </div>
  );
}
