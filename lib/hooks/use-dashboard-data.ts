"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { callMarketDataApi, innerData } from "@/lib/ai/chat-utils";
import { useWallet } from "@/lib/contexts/wallet-context";

export interface DashboardStats {
  tokenHoldings: number;
  totalTransactions: number;
  activeChains: number;
  totalTokens: number;
}

interface UseDashboardDataOptions {
  autoRefreshMs?: number;
}

export interface UseDashboardDataResult {
  loading: boolean;
  error: string | null;
  stats: DashboardStats;
  tokenAssets: any[];
  transactions: any[];
  candlestickChart: any | null;
  currentPrice: string;
  portfolioValue: string;
  lastUpdated: Date;
  refresh: () => Promise<void>;
}

export function useDashboardData(
  opts: UseDashboardDataOptions = {},
): UseDashboardDataResult {
  const { connected, publicKey } = useWallet();
  const address = useMemo(() => publicKey || "", [publicKey]);

  const isFetching = useRef(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    tokenHoldings: 0,
    totalTransactions: 0,
    activeChains: 1,
    totalTokens: 0,
  });
  const [tokenAssets, setTokenAssets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [candlestickChart, setCandlestickChart] = useState<any | null>(null);
  const [currentPrice, setCurrentPrice] = useState("0");
  const [portfolioValue, setPortfolioValue] = useState("0");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchKey = useCallback(
    (key: string) => callMarketDataApi(key, "SOL", address),
    [address],
  );

  const fetchAll = useCallback(async () => {
    if (!connected) {
      setTokenAssets([]);
      setTransactions([]);
      setPortfolioValue("0");
      setCurrentPrice("0");
      setCandlestickChart(null);
      setStats({
        tokenHoldings: 0,
        totalTransactions: 0,
        activeChains: 0,
        totalTokens: 0,
      });
      setLastUpdated(new Date());
      setError("Connect your wallet to load dashboard data");
      setLoading(false);
      return;
    }

    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    setError(null);

    try {
      const [balRes, txRes, valueRes, candleRes, priceRes] = await Promise.all([
        fetchKey("token_balances"),
        fetchKey("transaction_history"),
        fetchKey("portfolio_value"),
        fetchKey("candlestick"),
        fetchKey("price"),
      ]);

      const balInner = innerData(balRes)?.[0]?.tokenAssets ?? [];
      const balTokens = balInner.filter(
        (t: any) => Number(t.balance) * Number(t.tokenPrice) > 0.01,
      );

      const txs =
        innerData(txRes)?.[0]?.transactions ??
        innerData(txRes)?.[0]?.transactionList ??
        [];

      const valueRaw =
        (valueRes?.data?.totalValue as string | number | undefined) ??
        balTokens.reduce(
          (tot: number, t: any) =>
            tot + Number(t.balance) * Number(t.tokenPrice),
          0,
        );

      const priceNum =
        innerData(priceRes)?.[0]?.price ??
        balTokens.find((t: any) => t.symbol === "SOL")?.tokenPrice ??
        "0";

      const candleData = candleRes?.data?.length ? candleRes : null;

      setTokenAssets(balTokens);
      setTransactions(txs);
      setPortfolioValue(String(valueRaw || 0));
      setCurrentPrice(String(priceNum));
      setCandlestickChart(candleData);
      setStats({
        tokenHoldings: balTokens.length,
        totalTransactions: txs.length,
        activeChains: 1,
        totalTokens: balTokens.length,
      });
      setLastUpdated(new Date());
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [connected, fetchKey]);

  const autoRefresh = opts.autoRefreshMs ?? 300_000;
  useEffect(() => {
    fetchAll();
    if (autoRefresh) {
      const t = setInterval(fetchAll, autoRefresh);
      return () => clearInterval(t);
    }
  }, [fetchAll, autoRefresh]);

  useEffect(() => {
    fetchAll();
  }, [connected, publicKey, fetchAll]);

  return {
    loading,
    error,
    stats,
    tokenAssets,
    transactions,
    candlestickChart,
    currentPrice,
    portfolioValue,
    lastUpdated,
    refresh: fetchAll,
  };
}
