"use client";

import { chainList } from "@/lib/constants";
import type { Token } from "@/types/api/cross-chain";

import ChainSelector from "./chain-selector";
import TokenSelector from "./token-selector";

type Chain = (typeof chainList)[number];

interface Props {
  label: "From" | "To";
  chain: Chain;
  onChainSelect: (c: Chain) => void;
  chainDisabled?: boolean;

  tokenList: Token[];
  token: Token | null;
  onTokenSelect: (t: Token) => void;
  tokenLoading?: boolean;

  amount: string;
  onAmountChange?: (v: string) => void;
  readOnly?: boolean;

  walletAddress: string;
}

export default function AmountPanel({
  label,
  chain,
  onChainSelect,
  chainDisabled,
  tokenList,
  token,
  onTokenSelect,
  tokenLoading,
  amount,
  onAmountChange,
  readOnly,
  walletAddress,
}: Props) {
  return (
    <div className="p-6">
      {/* chain & label */}
      <div className="flex justify-between mb-2">
        <span className="text-sm text-white/60">{label}</span>
        <ChainSelector
          selected={chain}
          onSelect={onChainSelect}
          disabled={chainDisabled}
        />
      </div>

      {/* amount & token */}
      <div className="flex justify-between items-center mb-2">
        <input
          type="text"
          value={amount}
          readOnly={readOnly}
          onChange={(e) => onAmountChange?.(e.target.value)}
          className="text-2xl font-medium bg-transparent outline-none w-[60%] text-white"
        />
        <TokenSelector
          tokens={tokenList}
          selected={token}
          onSelect={onTokenSelect}
          loading={tokenLoading}
          disabled={tokenLoading}
        />
      </div>

      {/* wallet */}
      <div className="text-sm text-white/60">
        Balance • Wallet: {walletAddress.slice(0, 8)}…
      </div>
    </div>
  );
}
