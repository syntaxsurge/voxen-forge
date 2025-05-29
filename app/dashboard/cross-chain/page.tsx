"use client";

import { ArrowLeftRight, RefreshCw, Sparkles } from "lucide-react";

import PageCard from "@/components/custom-ui/page-card";
import PairStatusAlert from "@/components/dashboard/cross-chain/pair-status-alert";
import Sidebar from "@/components/dashboard/cross-chain/sidebar";
import SupportedPairsModal from "@/components/dashboard/cross-chain/supported-pairs-modal";
import SwapForm from "@/components/dashboard/cross-chain/swap-form";
import SwapResultCard from "@/components/dashboard/cross-chain/swap-result-card";
import ErrorBanner from "@/components/dashboard/overview/error-banner";
import { Button } from "@/components/ui/button";
import { useCrossChainSwap } from "@/lib/hooks/use-cross-chain-swap";

export default function CrossChainSwapPage() {
  const swap = useCrossChainSwap();
  const { uiFlags, setUiFlags } = swap;

  const actions = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="border-white/20 hover:bg-white/10 text-white gap-2"
        onClick={() =>
          setUiFlags((u) => ({
            ...u,
            showSupportedPairs: !u.showSupportedPairs,
          }))
        }
        disabled={swap.supportedPairs.length === 0}
      >
        <Sparkles className="h-4 w-4" /> View Pairs
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full border-white/20 hover:bg-white/10 text-white"
        onClick={swap.refresh}
        disabled={swap.isLoading || swap.rateLimit.limited}
      >
        <RefreshCw
          className={`h-4 w-4 ${swap.isLoading ? "animate-spin" : ""}`}
        />
      </Button>
    </div>
  );

  return (
    <PageCard
      icon={ArrowLeftRight}
      title="Cross-Chain Swap"
      description={`Bridge tokens across blockchains • ${swap.supportedPairs.length} pairs • ${swap.supportedBridges.length} bridges`}
      actions={actions}
    >
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PairStatusAlert
              pairStatus={swap.pairStatus}
              fromToken={swap.fromToken}
              toToken={swap.toToken}
            />
            <SwapForm swap={swap} />
          </div>

          <Sidebar
            fromChainIndex={swap.fromChain.index}
            toChainIndex={swap.toChain.index}
            supportedPairs={swap.supportedPairs}
            bridges={swap.supportedBridges}
            pairStatusBridges={swap.pairStatus.bridges}
          />
        </div>

        <ErrorBanner error={swap.error} />

        {swap.swapResult && (
          <SwapResultCard
            swapResult={swap.swapResult}
            fromToken={swap.fromToken}
            toToken={swap.toToken}
          />
        )}

        <SupportedPairsModal
          visible={uiFlags.showSupportedPairs}
          pairs={swap.supportedPairs}
          onClose={() =>
            setUiFlags((u) => ({ ...u, showSupportedPairs: false }))
          }
        />
      </div>
    </PageCard>
  );
}
