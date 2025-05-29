"use client";

import { useState } from "react";

import { ChevronDown, Check, Loader2, Search } from "lucide-react";

import { TokenIcon } from "@/components/custom-ui/token-icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Token } from "@/types/api/cross-chain";

interface Props {
  tokens: Token[];
  selected: Token | null;
  onSelect: (t: Token) => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function TokenSelector({
  tokens,
  selected,
  onSelect,
  loading = false,
  disabled = false,
}: Props) {
  /* --------------------------- loading spinner --------------------------- */
  if (loading) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2 bg-white/10 text-white cursor-default"
        disabled
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading
      </Button>
    );
  }

  /* --------------------------- local state ------------------------------- */
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = tokens.filter(
    (t) =>
      t.symbol.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase()),
  );

  /* ------------------------------ render --------------------------------- */
  return (
    <DropdownMenu
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setSearch("");
      }}
    >
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 bg-white/10 hover:bg-white/20 text-white font-medium"
        >
          {selected ? (
            <TokenIcon token={selected} />
          ) : (
            <div className="w-5 h-5 rounded-full bg-gray-500" />
          )}
          {selected?.symbol || "Select"}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 bg-black/95 border border-white/10 backdrop-blur-md p-0 overflow-y-hidden"
      >
        {/* search box */}
        <div className="flex items-center gap-2 p-3 border-b border-white/10">
          <Search className="h-4 w-4 text-white/60" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search token…"
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/40"
          />
        </div>
        <DropdownMenuSeparator className="m-0" />

        {/* token list */}
        <div className="max-h-96 overflow-y-auto">
          {filtered.length ? (
            filtered.map((token) => (
              <DropdownMenuItem
                key={token.address}
                onClick={() => {
                  onSelect(token);
                  setOpen(false);
                  setSearch("");
                }}
                className="gap-3 py-2 px-3 cursor-pointer text-sm text-white focus:bg-white/5"
              >
                <TokenIcon token={token} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{token.symbol}</div>
                  <div className="text-xs text-white/60 truncate">
                    {token.name}
                  </div>
                  <div className="text-xs text-white/40 font-mono truncate">
                    {token.address.slice(0, 8)}…{token.address.slice(-6)}
                  </div>
                </div>
                {selected?.address === token.address && (
                  <Check className="h-3 w-3 text-green-400 flex-shrink-0" />
                )}
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-white/60">
              No tokens found
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
