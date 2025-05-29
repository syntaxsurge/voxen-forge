"use client";

import {
  DollarSign,
  TrendingUp,
  ListChecks,
  CreditCard,
  Globe,
  Clock,
} from "lucide-react";

import StatsCard from "@/components/dashboard/stats-card";
import type { DashboardStats } from "@/lib/hooks/use-dashboard-data";
import { formatCurrency } from "@/lib/utils";

interface Props {
  loading: boolean;
  stats: DashboardStats;
  portfolioValue: string;
  currentPrice: string;
  lastUpdated: Date;
}

export default function StatsSection({
  loading,
  stats,
  portfolioValue,
  currentPrice,
  lastUpdated,
}: Props) {
  /* ---------------------------------------------------------------------- */
  /*                             Card metadata                              */
  /* ---------------------------------------------------------------------- */
  const cards = [
    {
      title: "Portfolio Value",
      value: loading ? "Loading…" : formatCurrency(portfolioValue),
      change: `${stats.totalTokens} tokens tracked`,
      trend: "neutral" as const,
      icon: DollarSign,
      gradientFrom: "#4ADE80",
      gradientTo: "#22D3EE",
    },
    {
      title: "SOL Price",
      value: loading ? "Loading…" : `$${Number(currentPrice).toFixed(2)}`,
      change: "Live market rate",
      trend: "neutral" as const,
      icon: TrendingUp,
      gradientFrom: "#A855F7",
      gradientTo: "#6366F1",
    },
    {
      title: "Transactions",
      value: loading ? "Loading…" : stats.totalTransactions.toString(),
      change: "Non-zero transfers",
      trend: "neutral" as const,
      icon: CreditCard,
      gradientFrom: "#F97316",
      gradientTo: "#F43F5E",
    },
    {
      title: "Active Tokens",
      value: loading ? "Loading…" : stats.totalTokens.toString(),
      change: "Across portfolio",
      trend: "neutral" as const,
      icon: ListChecks,
      gradientFrom: "#3B82F6",
      gradientTo: "#06B6D4",
    },
    {
      title: "Active Chains",
      value: loading ? "Loading…" : stats.activeChains.toString(),
      change: "Networks monitored",
      trend: "neutral" as const,
      icon: Globe,
      gradientFrom: "#F59E0B",
      gradientTo: "#84CC16",
    },
    {
      title: "Last Sync",
      value: lastUpdated.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      change: "Auto-refresh in 3 mins",
      trend: "neutral" as const,
      icon: Clock,
      gradientFrom: "#14B8A6",
      gradientTo: "#4F46E5",
    },
  ] as const;

  /* ---------------------------------------------------------------------- */
  /*                                 Render                                 */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
      {cards.map((c) => (
        <StatsCard key={c.title} {...c} loading={loading} />
      ))}
    </div>
  );
}
