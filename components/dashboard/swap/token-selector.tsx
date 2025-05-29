"use client";

import { useState, useRef, useEffect } from "react";

import { ChevronDown, Check, Search } from "lucide-react";

import { TokenIcon } from "@/components/custom-ui/token-icon";
import { Button } from "@/components/ui/button";
import type { SwapToken } from "@/types/swap";

interface Props {
  tokens: SwapToken[];
  selected: SwapToken | null;
  onSelect: (t: SwapToken) => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function TokenSelector({
  tokens,
  selected,
  onSelect,
  loading,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  if (loading) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-9 w-24 bg-white/10 text-white"
        disabled
      >
        Loading…
      </Button>
    );
  }

  const filtered = tokens
    .filter(
      (t) =>
        t.symbol.toLowerCase().includes(search.toLowerCase()) ||
        t.name.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      const balA = Number(a.balance ?? 0);
      const balB = Number(b.balance ?? 0);
      if (balA === balB) return a.symbol.localeCompare(b.symbol);
      return balB - balA;
    });

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="gap-2 h-9 bg-white/10 text-white"
      >
        {selected ? (
          <TokenIcon token={selected} />
        ) : (
          <div className="w-5 h-5 rounded-full bg-gray-500" />
        )}
        {selected?.symbol || "Select"}
        <ChevronDown className="h-4 w-4" />
      </Button>

      {open && (
        <div className="absolute z-50 mt-2 w-72 max-h-96 overflow-y-auto rounded-xl border border-white/10 bg-black/95 backdrop-blur-md shadow-xl">
          {/* search */}
          <div className="flex items-center gap-2 p-3 border-b border-white/10">
            <Search className="h-4 w-4 text-white/60" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search token…"
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/40"
            />
          </div>

          {filtered.length ? (
            filtered.map((tok) => (
              <button
                key={tok.address}
                onClick={() => {
                  onSelect(tok);
                  setOpen(false);
                  setSearch("");
                }}
                className="flex w-full items-center gap-3 px-3 py-2 hover:bg-white/5 text-white text-sm"
              >
                <TokenIcon token={tok} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{tok.symbol}</div>
                  <div className="text-xs text-white/60 truncate">
                    {tok.name}
                  </div>
                </div>
                {Number(tok.balance ?? 0) > 0 && (
                  <span className="text-xs text-white/60 mr-1">
                    {tok.balance}
                  </span>
                )}
                {selected?.address === tok.address && (
                  <Check className="h-3 w-3 text-green-400" />
                )}
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-white/60">
              No tokens found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
