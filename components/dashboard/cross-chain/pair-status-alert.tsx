"use client";

import { CheckCircle, AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { Token } from "@/types/api/cross-chain";

interface Props {
  pairStatus: { valid: boolean; message: string };
  fromToken: Token | null;
  toToken: Token | null;
}

export default function PairStatusAlert({
  pairStatus,
  fromToken,
  toToken,
}: Props) {
  if (!fromToken || !toToken) return null;

  const base =
    "mb-4 border transition-colors " +
    (pairStatus.valid
      ? "bg-green-900/20 border-green-500/30"
      : "bg-amber-900/20 border-amber-500/30");

  return (
    <Card className={base}>
      <CardContent className="p-4">
        <div
          className={`flex items-center gap-2 text-sm ${
            pairStatus.valid ? "text-green-400" : "text-amber-400"
          }`}
        >
          {pairStatus.valid ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          {pairStatus.message}
        </div>
      </CardContent>
    </Card>
  );
}
