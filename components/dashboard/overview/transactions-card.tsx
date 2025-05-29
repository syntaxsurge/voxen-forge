"use client";

import { ArrowUpRight, ArrowDownLeft, Clock, ExternalLink } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTokenAmount } from "@/lib/utils";

interface Props {
  transactions: any[];
  loading: boolean;
}

export default function TransactionsCard({ transactions, loading }: Props) {
  return (
    <Card className="bg-black/20 border-white/10 hover:border-white/20 transition-all hover:shadow-xl h-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">
          Latest Activity ({transactions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-white/60 text-center py-8">
              Loading transactions…
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-white/60 text-center py-8">
              No recent transactions found.
            </div>
          ) : (
            transactions.slice(0, 5).map((tx: any, idx: number) => {
              const amountNum = Number(tx.amount || 0);
              const incoming = amountNum > 0;
              return (
                <div
                  key={tx.txHash ? `${tx.txHash}-${idx}` : idx}
                  className="flex justify-between items-center p-4 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2.5 rounded-full ${
                        incoming
                          ? "bg-emerald-600/15 text-emerald-400 border border-emerald-400/30"
                          : "bg-rose-600/15 text-rose-400 border border-rose-400/30"
                      }`}
                    >
                      {incoming ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white/90">
                        {tx.symbol || "SOL"}
                      </p>
                      <p className="text-xs text-white/60 flex items-center gap-1">
                        <Clock className="h-3 w-3 inline" />
                        {tx.txTime
                          ? new Date(Number(tx.txTime) * 1000).toLocaleString()
                          : "Pending"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${
                        incoming ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {formatTokenAmount(Math.abs(amountNum))}
                    </p>
                    <p className="text-xs text-white/60 flex items-center justify-end gap-1">
                      {tx.txHash
                        ? `${tx.txHash.slice(0, 8)}…${tx.txHash.slice(-6)}`
                        : "Transaction"}{" "}
                      {tx.txHash && (
                        <a
                          href={`https://solscan.io/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-white"
                        >
                          <ExternalLink className="h-3 w-3 inline" />
                        </a>
                      )}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
