"use client";

import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Loader2,
  Bot,
} from "lucide-react";

import PageCard from "@/components/custom-ui/page-card";
import SolanaCandlestickChart from "@/components/dashboard/candlestick-chart";
import SummaryCard from "@/components/dashboard/sentiment-radar/summary-card";
import StatsCard from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import { useSentimentRadar } from "@/lib/hooks/use-sentiment-radar";

const GRADIENTS = {
  green: ["#4ADE80", "#22D3EE"],
  blue: ["#60A5FA", "#818CF8"],
  amber: ["#FBBF24", "#F97316"],
  purple: ["#A855F7", "#6366F1"],
};

export default function SentimentRadarPage() {
  const {
    loading,
    candlestickChart,
    metrics,
    summary,
    aiLoading,
    analyzeWithAI,
  } = useSentimentRadar("SOL", 300_000);

  if (loading && !candlestickChart)
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="h-6 w-6 animate-spin text-white/60" />
      </div>
    );

  const cards = [
    {
      title: "Sentiment Score",
      value: metrics.sentimentScore.toFixed(1),
      change: "Composite index",
      trend:
        metrics.sentimentScore > 60
          ? "up"
          : metrics.sentimentScore < 40
            ? "down"
            : "neutral",
      gradient: GRADIENTS.green,
      icon: metrics.sentimentScore >= 50 ? TrendingUp : TrendingDown,
    },
    {
      title: "24h Price Δ",
      value: `${metrics.priceChangePct >= 0 ? "+" : ""}${metrics.priceChangePct.toFixed(2)}%`,
      change: "Since previous close",
      trend: metrics.priceChangePct >= 0 ? "up" : "down",
      gradient: GRADIENTS.blue,
      icon: metrics.priceChangePct >= 0 ? TrendingUp : TrendingDown,
    },
    {
      title: "Buy Ratio",
      value: `${(metrics.buyRatio * 100).toFixed(1)}%`,
      change: "Buys / total trades",
      trend: metrics.buyRatio > 0.5 ? "up" : "down",
      gradient: GRADIENTS.amber,
      icon: metrics.buyRatio > 0.5 ? TrendingUp : TrendingDown,
    },
    {
      title: "1h Volume",
      value: `$${metrics.volumeUsd.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })}`,
      change: "Aggregated USD",
      trend: "neutral" as const,
      gradient: GRADIENTS.purple,
      icon: BarChart3,
    },
  ];

  const actions = (
    <Button
      variant="outline"
      size="sm"
      className="gap-1 border-white/20 hover:bg-white/10 text-white"
      onClick={analyzeWithAI}
      disabled={aiLoading}
    >
      {aiLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Bot className="h-4 w-4" />
      )}
      Analyze with AI
    </Button>
  );

  return (
    <PageCard
      icon={BarChart3}
      title="Sentiment Radar"
      description="Aggregated market mood for SOL"
      actions={actions}
    >
      <div className="flex flex-col gap-10 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c) => (
            <StatsCard
              key={c.title}
              title={c.title}
              value={c.value}
              change={c.change}
              trend={c.trend as any}
              icon={c.icon}
              gradientFrom={c.gradient[0]}
              gradientTo={c.gradient[1]}
            />
          ))}
        </div>
        {summary && <SummaryCard summary={summary} />}
        {candlestickChart && (
          <SolanaCandlestickChart
            data={candlestickChart}
            title="SOL / USD - 24h Candles"
          />
        )}
      </div>
    </PageCard>
  );
}
