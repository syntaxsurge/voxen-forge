"use client";

import { BarChart3 } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { markdownToHtml } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                               Helper shapes                                */
/* -------------------------------------------------------------------------- */

interface ChangedTokenInfo {
  amount: string;
  tokenSymbol: string;
}

interface Trade {
  dexName?: string;
  type?: string; // buy | sell
  price?: string; // USD price
  time?: string | number;
  volume?: string; // total USD volume
  changedTokenInfo?: ChangedTokenInfo[];
}

/* -------------------------------------------------------------------------- */
/*                               Util helpers                                 */
/* -------------------------------------------------------------------------- */

const fmtNum = (n: number, max = 6) =>
  n.toLocaleString(undefined, { maximumFractionDigits: max });

/** Extract SOL amount from changedTokenInfo or derive fallback */
function getSolAmount(t: Trade): number {
  if (Array.isArray(t.changedTokenInfo)) {
    const sol = t.changedTokenInfo.find(
      (c) => (c.tokenSymbol || "").toUpperCase() === "SOL",
    );
    if (sol) return Number(sol.amount || 0);
  }
  // Fallback to volume divided by price if sensible
  const vol = Number(t.volume || 0);
  const prc = Number(t.price || 0);
  if (vol && prc) return vol / prc;
  return 0;
}

/** Extract the counter (non-SOL) token amount & symbol */
function getCounterToken(t: Trade): { amount: number; symbol: string } {
  if (Array.isArray(t.changedTokenInfo)) {
    const other = t.changedTokenInfo.find(
      (c) => (c.tokenSymbol || "").toUpperCase() !== "SOL",
    );
    if (other) {
      return { amount: Number(other.amount || 0), symbol: other.tokenSymbol };
    }
  }
  return { amount: 0, symbol: "—" };
}

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

interface Props {
  title: string;
  trades: Trade[];
  summary?: string;
}

export default function RecentTradesCard({ title, trades, summary }: Props) {
  if (!Array.isArray(trades) || trades.length === 0) return null;
  const rows = trades.slice(0, 10);

  return (
    <Card className="w-full backdrop-blur-sm border bg-muted/40 border-border dark:bg-black/40 dark:border-white/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-foreground dark:text-white">
          <BarChart3 className="h-5 w-5" /> {title} ({rows.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/60">
                <th className="text-left py-2">DEX</th>
                <th className="text-left py-2">Side</th>
                <th className="text-right py-2">Price&nbsp;(USD)</th>
                <th className="text-right py-2">SOL&nbsp;Amt</th>
                <th className="text-right py-2">Token</th>
                <th className="text-right py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t, i) => {
                const price = Number(t.price || 0);
                const solAmt = getSolAmount(t);
                const { amount: tokAmt, symbol: tokSym } = getCounterToken(t);
                const timeStr = t.time
                  ? new Date(Number(t.time)).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—";
                return (
                  <tr
                    key={i}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 text-white">{t.dexName || "—"}</td>
                    <td
                      className={`py-3 ${
                        t.type === "buy" ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {t.type?.toUpperCase() ?? "—"}
                    </td>
                    <td className="py-3 text-right text-white">
                      ${fmtNum(price, 4)}
                    </td>
                    <td className="py-3 text-right text-white">
                      {fmtNum(solAmt, 6)}
                    </td>
                    <td className="py-3 text-right text-white">
                      {tokSym !== "—" ? `${fmtNum(tokAmt, 6)} ${tokSym}` : "—"}
                    </td>
                    <td className="py-3 text-right text-white/70">{timeStr}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

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
