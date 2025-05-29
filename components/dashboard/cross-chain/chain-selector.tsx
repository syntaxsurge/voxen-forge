"use client";

import { useState } from "react";

import { ChevronDown, Check, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { chainList } from "@/lib/constants";

type Chain = (typeof chainList)[number];

interface Props {
  selected: Chain;
  onSelect: (c: Chain) => void;
  disabled?: boolean;
}

export default function ChainSelector({
  selected,
  onSelect,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = chainList.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.index.includes(search),
  );

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
          className="border-white/20 hover:bg-white/10 text-white text-xs h-8 gap-2"
        >
          <div
            className={`w-3 h-3 rounded-full bg-gradient-to-r ${selected.color}`}
          />
          {selected.name}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 bg-black/95 border border-white/10 backdrop-blur-md p-0 overflow-y-hidden"
      >
        {/* Search box */}
        <div className="flex items-center gap-2 p-3 border-b border-white/10">
          <Search className="h-4 w-4 text-white/60" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chain…"
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/40"
          />
        </div>
        <DropdownMenuSeparator className="m-0" />

        {/* Chain list */}
        <div className="max-h-80 overflow-y-auto">
          {filtered.length ? (
            filtered.map((chain) => (
              <DropdownMenuItem
                key={chain.index}
                onClick={() => {
                  onSelect(chain);
                  setOpen(false);
                  setSearch("");
                }}
                className="gap-3 py-2 px-3 cursor-pointer text-sm text-white focus:bg-white/5"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-gradient-to-r ${chain.color}`}
                />
                <span className="flex-1">{chain.name}</span>
                {selected.index === chain.index && (
                  <Check className="h-3 w-3 text-green-400 flex-shrink-0" />
                )}
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-white/60">
              No chains found
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
