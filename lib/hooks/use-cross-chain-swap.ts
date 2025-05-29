"use client";

import { useState, useEffect, useMemo } from "react";

import { useWallet } from "@/lib/contexts/wallet-context";
import { fetchCachedJson } from "@/lib/network/fetch-cache";
import { sleep, toRawAmount, fromRawAmount } from "@/lib/utils";
import type {
  Token,
  PairRaw,
  Bridge,
  CrossChainSwapResult,
} from "@/types/api/cross-chain";

import { chainList, routeOptions } from "../constants";

/* -------------------------------------------------------------------------- */
/*                         Module-level persistent cache                      */
/* -------------------------------------------------------------------------- */

const G_CC = {
  bridges: [] as Bridge[],
  pairs: [] as PairRaw[],
  tokenCache: new Map<string, Token[]>(), // chainIndex → tokens[]
  loaded: false,
  fromChain: chainList[0],
  toChain: chainList[1],
  fromToken: null as Token | null,
  toToken: null as Token | null,
  fromAmount: "0.1",
  toAmount: "",
  swapResult: null as CrossChainSwapResult | null,
};

export interface UseCrossChainSwap {
  fromChain: (typeof chainList)[number];
  toChain: (typeof chainList)[number];
  setFromChain: (c: (typeof chainList)[number]) => void;
  setToChain: (c: (typeof chainList)[number]) => void;
  fromTokens: Token[];
  toTokens: Token[];
  fromToken: Token | null;
  toToken: Token | null;
  setFromToken: (t: Token | null) => void;
  setToToken: (t: Token | null) => void;
  fromAmount: string;
  setFromAmount: (v: string) => void;
  toAmount: string;
  supportedPairs: PairRaw[];
  supportedBridges: Bridge[];
  loadingFlags: {
    bridges: boolean;
    pairs: boolean;
    fromTokens: boolean;
    toTokens: boolean;
  };
  isLoading: boolean;
  uiFlags: {
    showRouteOptions: boolean;
    showSupportedPairs: boolean;
  };
  setUiFlags: React.Dispatch<
    React.SetStateAction<{
      showRouteOptions: boolean;
      showSupportedPairs: boolean;
    }>
  >;
  rateLimit: {
    limited: boolean;
    next: number;
    count: number;
  };
  pairStatus: {
    valid: boolean;
    message: string;
    bridges: Bridge[];
  };
  swapResult: CrossChainSwapResult | null;
  error: string | null;
  walletForChain: (c: (typeof chainList)[number]) => string;
  refresh: () => void;
  buildTransaction: () => Promise<void>;
}

export function useCrossChainSwap(): UseCrossChainSwap {
  /* ------------------------------ state ---------------------------------- */

  const [fromChain, setFromChain] = useState(G_CC.fromChain);
  const [toChain, setToChain] = useState(G_CC.toChain);
  const [fromTokens, setFromTokens] = useState<Token[]>(
    G_CC.tokenCache.get(G_CC.fromChain.index) ?? [],
  );
  const [toTokens, setToTokens] = useState<Token[]>(
    G_CC.tokenCache.get(G_CC.toChain.index) ?? [],
  );
  const [fromToken, setFromToken] = useState<Token | null>(G_CC.fromToken);
  const [toToken, setToToken] = useState<Token | null>(G_CC.toToken);
  const [supportedPairs, setSupportedPairs] = useState<PairRaw[]>(G_CC.pairs);
  const [supportedBridges, setSupportedBridges] = useState<Bridge[]>(
    G_CC.bridges,
  );
  const [fromAmount, setFromAmount] = useState(G_CC.fromAmount);
  const [toAmount, setToAmount] = useState(G_CC.toAmount);
  const [slippage] = useState("0.01");
  const routeSort = routeOptions[0].value;
  const [feePercent] = useState("0.1");
  const [swapResult, setSwapResult] = useState<CrossChainSwapResult | null>(
    G_CC.swapResult,
  );
  const [loadingFlags, setLoadingFlags] = useState({
    bridges: false,
    pairs: false,
    fromTokens: false,
    toTokens: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState({
    limited: false,
    next: 0,
    count: 0,
  });
  const [uiFlags, setUiFlags] = useState({
    showRouteOptions: false,
    showSupportedPairs: false,
  });
  const { connected, publicKey } = useWallet();
  const walletForChain = (_c: (typeof chainList)[number]) => publicKey || "";

  /* ---------------------------------------------------------------------- */
  /*                         Generic cached fetcher                         */
  /* ---------------------------------------------------------------------- */

  async function cachedRequest(
    url: string,
    flagKey: keyof typeof loadingFlags,
    force = false,
  ) {
    if (!force && G_CC.loaded) return fetchCachedJson(url, { force: false });
    setLoadingFlags((f) => ({ ...f, [flagKey]: true }));
    try {
      return await fetchCachedJson(url, { force });
    } catch {
      try {
        setRateLimit((p) => ({ ...p, count: p.count + 1 }));
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } finally {
        /* noop */
      }
    } finally {
      setLoadingFlags((f) => ({ ...f, [flagKey]: false }));
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                            Upstream loaders                            */
  /* ---------------------------------------------------------------------- */

  const loadBridges = (force = false) =>
    cachedRequest("/api/bridge-info", "bridges", force).then((res) => {
      const bridges: Bridge[] =
        res?.data?.bridges ?? (res?.bridges as Bridge[]) ?? [];
      setSupportedBridges(bridges);
      if (bridges.length) G_CC.bridges = bridges;
    });

  const loadPairs = (force = false) =>
    cachedRequest("/api/bridge-pairs", "pairs", force).then((res) => {
      const pairs: PairRaw[] =
        res?.data?.pairs ?? (res?.pairs as PairRaw[]) ?? [];
      setSupportedPairs(pairs);
      if (pairs.length) G_CC.pairs = pairs;
    });

  const loadTokens = async (force = false) => {
    try {
      const fromKey = fromChain.index;
      const toKey = toChain.index;

      if (!force) {
        const cachedFrom = G_CC.tokenCache.get(fromKey);
        const cachedTo = G_CC.tokenCache.get(toKey);
        if (cachedFrom) setFromTokens(cachedFrom);
        if (cachedTo) setToTokens(cachedTo);
        if (cachedFrom && cachedTo) return;
      }

      const fromUrl = `/api/bridge-tokens?type=cross-chain-supported&chainIndex=${fromKey}`;
      const fromRes = await cachedRequest(fromUrl, "fromTokens", force);
      const fromTok: Token[] =
        fromRes?.data?.tokens ?? (fromRes?.tokens as Token[]) ?? [];
      setFromTokens(fromTok);
      G_CC.tokenCache.set(fromKey, fromTok);

      const toUrl = `/api/bridge-tokens?type=cross-chain-supported&chainIndex=${toKey}`;
      const toRes = await cachedRequest(toUrl, "toTokens", force);
      const toTok: Token[] =
        toRes?.data?.tokens ?? (toRes?.tokens as Token[]) ?? [];
      setToTokens(toTok);
      G_CC.tokenCache.set(toKey, toTok);
    } catch (e: any) {
      setError(e.message || "Token load error");
    }
  };

  const loadAll = async (force = false) => {
    if (G_CC.loaded && !force) return;
    try {
      setError(null);
      await sleep(300);
      await Promise.all([loadBridges(force), loadPairs(force)]);
      await loadTokens(force);
      G_CC.loaded = true;
    } catch (e: any) {
      setError(e.message || "Failed to load data");
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                         initialiser + watchers                         */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    void loadAll();
  }, []);

  /* refresh token lists on chain change */
  useEffect(() => {
    void loadTokens();
  }, [fromChain, toChain]);

  /*                           Pair/bridge resolution                        */
  const pairStatus = useMemo(() => {
    if (!fromToken || !toToken)
      return { valid: false, message: "", bridges: [] as Bridge[] };

    const pair = supportedPairs.find(
      (p) =>
        p.fromChainIndex === fromChain.index &&
        p.toChainIndex === toChain.index &&
        p.fromTokenAddress.toLowerCase() === fromToken.address.toLowerCase() &&
        p.toTokenAddress.toLowerCase() === toToken.address.toLowerCase(),
    );

    if (!pair)
      return {
        valid: false,
        message: "Pair not supported",
        bridges: [] as Bridge[],
      };

    const bridges = supportedBridges.filter(
      (b) =>
        b.supportedChains.includes(fromChain.index) &&
        b.supportedChains.includes(toChain.index),
    );

    return {
      valid: true,
      message: `Supported by ${bridges.length} bridge(s)`,
      bridges,
    };
  }, [
    fromToken,
    toToken,
    supportedPairs,
    supportedBridges,
    fromChain.index,
    toChain.index,
  ]);

  /* ---------------------------------------------------------------------- */
  /*                          Transaction builder                           */
  /* ---------------------------------------------------------------------- */

  const buildTransaction = async () => {
    if (!connected || !publicKey) {
      setError("Connect your wallet first");
      return;
    }
    if (!pairStatus.valid) {
      setError(pairStatus.message);
      return;
    }
    setError(null);
    setSwapResult(null);
    try {
      const params = {
        action: "build-tx",
        fromChainIndex: fromChain.index,
        toChainIndex: toChain.index,
        fromChainId: fromChain.id,
        toChainId: toChain.id,
        fromTokenAddress: fromToken!.address,
        toTokenAddress: toToken!.address,
        amount: toRawAmount(fromAmount, fromToken!.decimals),
        slippage,
        userWalletAddress: publicKey,
        receiveAddress: publicKey,
        sort: routeSort,
        feePercent,
        priceImpactProtectionPercentage: "0.25",
      };
      const res = await fetch("/api/bridge-swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const json = await res.json();
      if (json.success && json.data?.length) {
        setSwapResult(json);
        setToAmount(
          fromRawAmount(json.data[0].toTokenAmount, toToken!.decimals),
        );
        G_CC.swapResult = json;
      } else {
        throw new Error(json.msg || "Swap failed");
      }
    } catch (e: any) {
      setError(e.message || "Network error");
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                      Global cache synchronisation                       */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    G_CC.fromChain = fromChain;
  }, [fromChain]);
  useEffect(() => {
    G_CC.toChain = toChain;
  }, [toChain]);
  useEffect(() => {
    G_CC.fromToken = fromToken;
  }, [fromToken]);
  useEffect(() => {
    G_CC.toToken = toToken;
  }, [toToken]);
  useEffect(() => {
    G_CC.fromAmount = fromAmount;
  }, [fromAmount]);
  useEffect(() => {
    G_CC.toAmount = toAmount;
  }, [toAmount]);

  /* ---------------------------------------------------------------------- */
  /*                             Derived flags                              */
  /* ---------------------------------------------------------------------- */

  const isLoading =
    loadingFlags.bridges ||
    loadingFlags.pairs ||
    loadingFlags.fromTokens ||
    loadingFlags.toTokens;

  return {
    fromChain,
    toChain,
    setFromChain,
    setToChain,
    fromTokens,
    toTokens,
    fromToken,
    toToken,
    setFromToken,
    setToToken,
    fromAmount,
    setFromAmount,
    toAmount,
    supportedPairs,
    supportedBridges,
    loadingFlags,
    isLoading,
    uiFlags,
    setUiFlags,
    rateLimit,
    pairStatus,
    swapResult,
    error,
    walletForChain,
    refresh: () => void loadAll(true),
    buildTransaction,
  };
}
