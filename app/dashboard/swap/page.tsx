"use client";

import React, { useCallback, useRef } from "react";

import {
  ArrowDown,
  Info,
  Zap,
  RefreshCw,
  ExternalLink,
  Copy,
  Loader2,
  ArrowLeftRight,
} from "lucide-react";

import PageCard from "@/components/custom-ui/page-card";
import InfoCard from "@/components/dashboard/swap/info-card";
import Sidebar from "@/components/dashboard/swap/sidebar";
import SlippageSelector from "@/components/dashboard/swap/slippage-selector";
import TokenSelector from "@/components/dashboard/swap/token-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSolanaSwap } from "@/lib/hooks/use-solana-swap";
import { fromRawAmount } from "@/lib/utils";
import type { SwapToken } from "@/types/swap";

/* -------------------------------------------------------------------------- */
/*                              Helper components                             */
/* -------------------------------------------------------------------------- */

const BalanceLine: React.FC<{ tok: SwapToken | null; onMax?: () => void }> = ({
  tok,
  onMax,
}) => (
  <div className="flex items-center justify-between text-sm text-white/60 mt-1">
    <span>Balance: {tok?.balance ?? "0"}</span>
    {onMax && (
      <button
        className="text-purple-400 hover:underline text-xs"
        onClick={onMax}
      >
        Max
      </button>
    )}
  </div>
);

interface AmountSectionProps {
  label: string;
  amount: string;
  onAmountChange?: (v: string) => void;
  readOnly?: boolean;
  token: SwapToken | null;
  onTokenChange: (t: SwapToken) => void;
  tokens: SwapToken[];
  tokensLoading: boolean;
}

const AmountSection: React.FC<AmountSectionProps> = ({
  label,
  amount,
  onAmountChange,
  readOnly = false,
  token,
  onTokenChange,
  tokens,
  tokensLoading,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAmountChange?.(e.target.value);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-white/60">{label}</span>
        <div className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30 text-xs text-purple-300 font-medium">
          Solana
        </div>
      </div>
      <div className="flex justify-between items-center mb-2">
        <input
          ref={inputRef}
          type="text"
          value={amount}
          readOnly={readOnly}
          onChange={handleChange}
          className="text-2xl font-medium bg-transparent outline-none w-[60%] text-white placeholder:text-white/40"
          placeholder="0.0"
        />
        <TokenSelector
          tokens={tokens}
          selected={token}
          onSelect={onTokenChange}
          loading={tokensLoading}
        />
      </div>
      <BalanceLine
        tok={token}
        onMax={
          readOnly || !onAmountChange
            ? undefined
            : () => onAmountChange(token?.balance ?? "0")
        }
      />
    </div>
  );
};

const IconBtn = ({
  icon: Icon,
  onClick,
  spinning = false,
}: {
  icon: any;
  onClick?: () => void;
  spinning?: boolean;
}) => (
  <Button
    variant="outline"
    size="icon"
    className="rounded-full border-white/20 hover:bg-white/10 text-white"
    onClick={onClick}
    disabled={spinning}
  >
    <Icon className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`} />
  </Button>
);

const ActionBtn = ({
  label,
  icon: Icon,
  onClick,
  loading,
  gradient,
}: {
  label: string;
  icon: any;
  onClick: () => void;
  loading: boolean;
  gradient: string;
}) => (
  <Button
    className={`py-6 text-sm gap-2 bg-gradient-to-r ${gradient} text-white`}
    size="lg"
    onClick={onClick}
    disabled={loading}
  >
    {loading ? (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        {label}…
      </>
    ) : (
      <>
        <Icon className="h-4 w-4" />
        {label}
      </>
    )}
  </Button>
);

/* -------------------------------------------------------------------------- */
/*                             Main swap component                            */
/* -------------------------------------------------------------------------- */

export default function SolanaSwapPage() {
  const {
    tokens,
    tokensLoading,
    tokensError,
    refreshTokens,
    fromToken,
    toToken,
    setFromToken,
    setToToken,
    swapTokens,
    fromAmount,
    setFromAmount,
    toAmount,
    slippage,
    setSlippage,
    quoting,
    getQuote,
    quote,
    executing,
    executeSwap,
    execute,
    error,
  } = useSolanaSwap();

  const fmt = (raw: string, dec: number) => fromRawAmount(raw, dec, 6);

  /* ------------------------ Token selection handlers ----------------------- */

  const handleSelectFromToken = useCallback(
    (tok: SwapToken) => setFromToken(tok),
    [setFromToken],
  );

  const handleSelectToToken = useCallback(
    (tok: SwapToken) => setToToken(tok),
    [setToToken],
  );

  const headerActions = (
    <IconBtn
      icon={RefreshCw}
      onClick={refreshTokens}
      spinning={tokensLoading}
    />
  );

  /* -------------------------------- Metrics ------------------------------- */

  const payHuman =
    quote && fromToken ? fmt(quote.fromTokenAmount, fromToken.decimals) : "0";
  const receiveHuman =
    quote && toToken ? fmt(quote.toTokenAmount, toToken.decimals) : "0";
  const minReceiveHuman =
    quote && toToken
      ? (
          parseFloat(receiveHuman) *
          (1 - parseFloat(slippage || "0") / 100)
        ).toFixed(6)
      : "0";

  const rawTxId: string =
    (execute as any)?.transactionId ??
    (execute as any)?.txId ??
    (execute as any)?.id ??
    "";
  const explorerUrl: string | undefined = (execute as any)?.explorerUrl;

  /* -------------------------------- Render -------------------------------- */

  return (
    <PageCard
      icon={ArrowLeftRight}
      title="Solana Swap"
      description={`Trade tokens on Solana • ${tokens.length} tokens`}
      actions={headerActions}
    >
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Swap panel */}
            <div className="backdrop-blur-sm bg-gradient-to-br from-purple-100/10 to-blue-100/10 border border-white/10 rounded-xl overflow-visible hover:border-white/20 transition-all">
              <AmountSection
                label="From"
                amount={fromAmount}
                onAmountChange={setFromAmount}
                token={fromToken}
                onTokenChange={handleSelectFromToken}
                tokens={tokens}
                tokensLoading={tokensLoading}
              />
              <div className="flex justify-center -mt-2 -mb-2 relative z-10">
                <Button
                  onClick={swapTokens}
                  size="icon"
                  className="rounded-full h-10 w-10 bg-gradient-to-r from-purple-500/20 to-blue-500/20"
                >
                  <ArrowDown className="h-5 w-5 text-white" />
                </Button>
              </div>
              <AmountSection
                label="To"
                amount={toAmount}
                readOnly
                token={toToken}
                onTokenChange={handleSelectToToken}
                tokens={tokens}
                tokensLoading={tokensLoading}
              />
            </div>

            {/* Slippage */}
            <Card className="mt-6 bg-gradient-to-br from-purple-100/10 to-blue-100/10 border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80 font-medium">
                    Slippage
                  </span>
                  <SlippageSelector
                    value={slippage}
                    onChange={setSlippage}
                    disabled={quoting || executing}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <ActionBtn
                label="Quote"
                icon={Info}
                onClick={getQuote}
                loading={quoting}
                gradient="from-purple-500/20 to-blue-500/20 border-purple-500/30"
              />
              <ActionBtn
                label="Execute"
                icon={Zap}
                onClick={executeSwap}
                loading={executing}
                gradient="from-green-500/20 to-emerald-500/20 border-green-500/30"
              />
            </div>

            {/* Error */}
            {error && (
              <Card className="mt-4 bg-red-900/20 border-red-500/30">
                <CardContent className="p-4">
                  <div className="text-red-400 text-sm">{error}</div>
                </CardContent>
              </Card>
            )}

            {/* Quote info */}
            {quote && !error && fromToken && toToken && (
              <InfoCard
                icon={Info}
                title="Quote"
                items={[
                  {
                    label: "You pay",
                    value: `${payHuman} ${fromToken.symbol}`,
                  },
                  {
                    label: "You receive",
                    value: `${receiveHuman} ${toToken.symbol}`,
                  },
                  {
                    label: "Min received",
                    value: minReceiveHuman,
                  },
                ]}
                gradientFrom="#7e22ce"
                gradientTo="#3b82f6"
              />
            )}

            {/* Execution info */}
            {execute && !error && (
              <InfoCard
                icon={Zap}
                title="Executed"
                items={[
                  {
                    label: "Tx ID",
                    value: rawTxId ? (
                      <span className="flex items-center">
                        <span className="font-mono">
                          {rawTxId.slice(0, 8)}…{rawTxId.slice(-8)}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 p-0 ml-1"
                          onClick={() => navigator.clipboard.writeText(rawTxId)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </span>
                    ) : (
                      "Instruction ready"
                    ),
                  },
                ]}
                gradientFrom="#059669"
                gradientTo="#10b981"
                footer={
                  explorerUrl && rawTxId ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 border-green-500/30 text-green-400"
                      onClick={() => window.open(explorerUrl, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                      View on Solscan
                    </Button>
                  ) : undefined
                }
              />
            )}

            {/* Token load error */}
            {tokensError && (
              <p className="mt-4 text-center text-xs text-red-400">
                {tokensError}
              </p>
            )}
          </div>

          {/* Sidebar */}
          <Sidebar />
        </div>
      </div>
    </PageCard>
  );
}
