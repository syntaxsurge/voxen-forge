"use client";

import { Activity } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { markdownToHtml } from "@/lib/utils";

interface Transaction {
  txHash: string;
  symbol?: string;
  amount: string;
  txTime: string | number;
}

interface Props {
  title: string;
  transactions: Transaction[];
  summary?: string;
}

function shortHash(hash: string, head = 6, tail = 6) {
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}

export default function TransactionHistoryCard({
  title,
  transactions,
  summary,
}: Props) {
  const rows = transactions.slice(0, 10);

  return (
    <Card className="w-full backdrop-blur-sm border bg-muted/40 border-border dark:bg-black/40 dark:border-white/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-foreground dark:text-white">
          <Activity className="h-5 w-5" /> {title} ({rows.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-center text-sm text-white/60 py-8">
            No recent transactions found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/60">
                  <th className="text-left py-2">Token</th>
                  <th className="text-right py-2">Amount</th>
                  <th className="text-right py-2">Date</th>
                  <th className="text-right py-2">Tx Hash</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((tx) => {
                  const amt = parseFloat(tx.amount || "0");
                  const date = new Date(
                    Number(tx.txTime) * 1000,
                  ).toLocaleString();
                  return (
                    <tr
                      key={tx.txHash}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 text-white">{tx.symbol || "SOL"}</td>
                      <td
                        className={`py-3 text-right ${
                          amt >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {amt.toFixed(6)}
                      </td>
                      <td className="py-3 text-right text-white/90">{date}</td>
                      <td className="py-3 text-right font-mono text-white/70">
                        {shortHash(tx.txHash)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {summary && (
          <div
            className="mt-4 text-sm text-white/70 prose prose-invert"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(summary) }}
          />
        )}
      </CardContent>
    </Card>
  );
}
