"use client";

import { Home, RefreshCw } from "lucide-react";

import PageCard from "@/components/custom-ui/page-card";
import ErrorBanner from "@/components/dashboard/overview/error-banner";
import StatsSection from "@/components/dashboard/overview/stats-section";
import TokenHoldingsCard from "@/components/dashboard/overview/token-holdings-card";
import TransactionsCard from "@/components/dashboard/overview/transactions-card";
import { Button } from "@/components/ui/button";
import { useDashboardData } from "@/lib/hooks/use-dashboard-data";

export default function DashboardPage() {
  const {
    loading,
    error,
    stats,
    tokenAssets,
    transactions,
    currentPrice,
    portfolioValue,
    lastUpdated,
    refresh,
  } = useDashboardData();

  const actions = (
    <Button
      variant="outline"
      size="icon"
      className="border-white/20 hover:bg-white/10 text-white"
      onClick={refresh}
      disabled={loading}
    >
      <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
    </Button>
  );

  return (
    <PageCard
      icon={Home}
      title="Dashboard"
      description="Your DeFi command center"
      actions={actions}
    >
      <div className="space-y-10">
        <StatsSection
          loading={loading}
          stats={stats}
          portfolioValue={portfolioValue}
          currentPrice={currentPrice}
          lastUpdated={lastUpdated}
        />

        <ErrorBanner error={error} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TransactionsCard transactions={transactions} loading={loading} />
          <TokenHoldingsCard tokenAssets={tokenAssets} loading={loading} />
        </div>
      </div>
    </PageCard>
  );
}
