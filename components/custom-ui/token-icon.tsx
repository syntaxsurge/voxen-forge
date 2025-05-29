"use client";

import React from "react";

import { getTokenGradient } from "@/lib/utils";

interface TokenLike {
  symbol: string;
  logoUrl?: string;
  hasLogo?: boolean;
}

export function TokenIcon({ token }: { token: TokenLike }) {
  if (token.logoUrl && token.hasLogo) {
    return (
      <div className="w-5 h-5 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
        <img
          src={token.logoUrl}
          alt={token.symbol}
          className="w-full h-full object-cover"
          onError={(e) => {
            const t = e.target as HTMLImageElement;
            t.style.display = "none";
            t.parentElement!.className = `w-5 h-5 rounded-full ${getTokenGradient(
              token.symbol,
            )} flex items-center justify-center text-white text-xs font-bold`;
            t.parentElement!.textContent = token.symbol.slice(0, 2);
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`w-5 h-5 rounded-full ${getTokenGradient(
        token.symbol,
      )} flex items-center justify-center text-white text-xs font-bold`}
    >
      {token.symbol.slice(0, 2)}
    </div>
  );
}
