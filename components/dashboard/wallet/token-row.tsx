"use client";

import { Send, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";

interface TokenRowProps {
  name: string;
  amount: string;
  value: string;
  address?: string;
  colorClass?: string;
  onSend?: () => void;
}

export default function TokenRow({
  name,
  amount,
  value,
  address,
  colorClass = "bg-white/20",
  onSend,
}: TokenRowProps) {
  const explorerUrl = address
    ? `https://solscan.io/token/${address}`
    : undefined;

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full ${colorClass} border border-white/10 flex items-center justify-center text-xs font-bold`}
        >
          {name.slice(0, 2)}
        </div>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-xs text-white/60">{amount}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium">{value}</p>
        <div className="flex justify-end gap-1 mt-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-white/10 text-white/80"
            onClick={onSend}
          >
            <Send className="h-3 w-3" />
          </Button>
          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-white/10"
            >
              <ExternalLink className="h-3 w-3 text-white/80" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
