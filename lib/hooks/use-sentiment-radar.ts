"use client";

import { useState, useEffect, useCallback } from "react";

import { callMarketDataApi, innerData } from "@/lib/ai/chat-utils";
import { chatWithContext } from "@/lib/openai";

interface SentimentMetrics {
  priceChangePct: number;
  buyRatio: number;
  volumeUsd: number;
  sentimentScore: number;
}

export interface UseSentimentRadar {
  loading: boolean;
  candlestickChart: any | null;
  metrics: SentimentMetrics;
  summary: string;
  aiLoading: boolean;
  analyzeWithAI: () => Promise<void>;
  refresh: () => Promise<void>;
}

function computeMetrics(candles: any[], trades: any[]): SentimentMetrics {
  const closeNow = candles.at(-1)?.[4] ?? 0;
  const closePrev = candles.at(-2)?.[4] ?? closeNow;
  const priceChangePct =
    closePrev !== 0 ? ((closeNow - closePrev) / closePrev) * 100 : 0;

  let buys = 0,
    total = 0,
    volumeUsd = 0;
  trades.forEach((t: any) => {
    total += 1;
    if ((t.type ?? "").toLowerCase() === "buy") buys += 1;
    const vol = Number(t.volume ?? 0);
    volumeUsd += Number.isFinite(vol) ? vol : 0;
  });
  const buyRatio = total ? buys / total : 0.5;

  let sentimentScore = 50 + priceChangePct * 0.5 + (buyRatio - 0.5) * 100 * 0.5;
  sentimentScore = Math.min(100, Math.max(0, sentimentScore));

  return { priceChangePct, buyRatio, volumeUsd, sentimentScore };
}

export function useSentimentRadar(
  tokenName = "SOL",
  autoRefreshMs = 300_000,
): UseSentimentRadar {
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [candlestickChart, setCandlestickChart] = useState<any | null>(null);
  const [metrics, setMetrics] = useState<SentimentMetrics>({
    priceChangePct: 0,
    buyRatio: 0.5,
    volumeUsd: 0,
    sentimentScore: 50,
  });
  const [summary, setSummary] = useState("");
  const [trades, setTrades] = useState<any[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [candleRes, tradesRes] = await Promise.all([
        callMarketDataApi("candlestick_history", tokenName),
        callMarketDataApi("trades", tokenName),
      ]);

      const candles = innerData(candleRes);
      const tradeRows = innerData(tradesRes);

      setCandlestickChart({ data: candles });
      setTrades(tradeRows);

      setMetrics(computeMetrics(candles, tradeRows));
    } finally {
      setLoading(false);
    }
  }, [tokenName]);

  const analyzeWithAI = useCallback(async () => {
    if (aiLoading || !candlestickChart) return;
    setAiLoading(true);
    try {
      const ctx = JSON.stringify(
        {
          token: tokenName,
          ...metrics,
          lastCandle: candlestickChart.data?.at(-1),
          tradesSample: trades.slice(0, 20),
        },
        null,
        2,
      );
      const ai = await chatWithContext(
        `Provide a comprehensive sentiment explanation for ${tokenName}.`,
        ctx,
      );
      setSummary(ai);
    } finally {
      setAiLoading(false);
    }
  }, [aiLoading, candlestickChart, metrics, trades, tokenName]);

  useEffect(() => {
    void refresh();
    if (autoRefreshMs) {
      const id = setInterval(refresh, autoRefreshMs);
      return () => clearInterval(id);
    }
  }, [refresh, autoRefreshMs]);

  return {
    loading,
    candlestickChart,
    metrics,
    summary,
    aiLoading,
    analyzeWithAI,
    refresh,
  };
}
