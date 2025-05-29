"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PairRaw } from "@/types/api/cross-chain";

interface Props {
  visible: boolean;
  pairs: PairRaw[];
  onClose: () => void;
}

export default function SupportedPairsModal({
  visible,
  pairs,
  onClose,
}: Props) {
  return (
    <Dialog open={visible} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>All Supported Pairs</DialogTitle>
        </DialogHeader>

        <Button
          size="icon"
          variant="ghost"
          className="absolute top-4 right-4 text-white/70 hover:text-white"
          onClick={onClose}
        >
          <ChevronDown className="h-5 w-5 rotate-180" />
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {pairs.map((p, idx) => (
            <div
              key={`${p.pairId}-${idx}`}
              className="p-3 bg-white/5 rounded border border-white/10 text-white text-sm flex justify-between"
            >
              <span>
                {p.fromTokenSymbol} → {p.toTokenSymbol}
              </span>
              <span className="text-white/60">
                {p.fromChainIndex} → {p.toChainIndex}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
