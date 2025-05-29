"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Transaction, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";

import { CHAIN_INDEX_MAP, innerData } from "@/lib/ai/chat-utils";
import { useWallet } from "@/lib/contexts/wallet-context";
import { fetchCachedJson } from "@/lib/network/fetch-cache";
import { toRawAmount, fromRawAmount } from "@/lib/utils";
import type { SwapToken } from "@/types/swap";

import { NATIVE_SOL_ADDRESS } from "../constants";

const DEFAULT_SLIPPAGE = "0.1";
const TOKEN_ENDPOINT = `/api/token-catalog?chainIndex=${CHAIN_INDEX_MAP["SOL"]}`;
interface GlobalState {
  tokens: SwapToken[];
  tokensLoaded: boolean;
  tokensError: string | null;
  fromToken: SwapToken | null;
  toToken: SwapToken | null;
  fromAmount: string;
  toAmount: string;
  slippage: string;
  quote: any | null;
  execute: any | null;
}

const G: GlobalState = {
  tokens: [],
  tokensLoaded: false,
  tokensError: null,
  fromToken: null,
  toToken: null,
  fromAmount: "0",
  toAmount: "",
  slippage: DEFAULT_SLIPPAGE,
  quote: null,
  execute: null,
};

/* ----------------------- Helper: Address normaliser ----------------------- */

function normalizeAddress(symbol: string, address: string | undefined | null) {
  const sym = symbol.toUpperCase();
  if (sym === "SOL") {
    if (!address || address === "" || address === NATIVE_SOL_ADDRESS)
      return NATIVE_SOL_ADDRESS;
  }
  if (!address || address === "") return "";
  return address.trim();
}
export interface UseSolanaSwap {
  tokens: SwapToken[];
  tokensLoading: boolean;
  tokensError: string | null;
  refreshTokens: () => void;

  fromToken: SwapToken;
  toToken: SwapToken;
  setFromToken: (t: SwapToken) => void;
  setToToken: (t: SwapToken) => void;
  swapTokens: () => void;

  fromAmount: string;
  setFromAmount: (v: string) => void;
  toAmount: string;

  slippage: string;
  setSlippage: (v: string) => void;

  quoting: boolean;
  quote: any | null;
  getQuote: () => Promise<void>;

  executing: boolean;
  execute: any | null;
  executeSwap: () => Promise<void>;

  error: string | null;
}

export function useSolanaSwap(): UseSolanaSwap {
  const {
    connected,
    publicKey,
    connection,
    sendTransaction: walletSendTx,
  } = useWallet();

  /* ---------------------------- Local state ------------------------------ */
  const [tokens, setTokens] = useState<SwapToken[]>(G.tokens);
  const [tokensLoading, setTokensLoading] = useState(false);
  const [tokensError, setTokensError] = useState<string | null>(G.tokensError);

  const [fromToken, setFromToken] = useState<SwapToken | null>(G.fromToken);
  const [toToken, setToToken] = useState<SwapToken | null>(G.toToken);

  const [fromAmount, setFromAmount] = useState(G.fromAmount);
  const [toAmount, setToAmount] = useState(G.toAmount);
  const [slippage, setSlippage] = useState(G.slippage);

  const [quoting, setQuoting] = useState(false);
  const [quote, setQuote] = useState<any | null>(G.quote);

  const [executing, setExecuting] = useState(false);
  const [execute, setExecute] = useState<any | null>(G.execute);

  const [error, setError] = useState<string | null>(null);

  const inFlight = useRef<Promise<void> | null>(null);

  const loadTokens = useCallback(
    async (force = false) => {
      if (G.tokensLoaded && !force) {
        setTokens(G.tokens);
        setTokensError(G.tokensError);
        return;
      }
      if (inFlight.current && !force) return inFlight.current;

      const task = (async () => {
        setTokensLoading(true);
        setError(null);
        setTokensError(null);
        try {
          const catalogRes = await fetchCachedJson<{
            success: boolean;
            data: any;
          }>(TOKEN_ENDPOINT, { force });
          if (!catalogRes?.success) {
            throw new Error(
              (catalogRes as any)?.details || "Token catalog error",
            );
          }

          const catalog: SwapToken[] =
            (catalogRes.data?.tokens as SwapToken[]) ?? [];

          const tokenMap = new Map<string, SwapToken>();
          catalog.forEach((t) => {
            const addr = normalizeAddress(t.symbol, t.address);
            if (!addr) return;
            tokenMap.set(addr.toLowerCase(), { ...t, address: addr });
          });

          /* Wallet balances merge */
          if (connected && publicKey) {
            try {
              const res = await fetch("/api/portfolio/token-balances", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  address: publicKey,
                  chains: CHAIN_INDEX_MAP["SOL"],
                  excludeRiskToken: "0",
                }),
              });
              const json = await res.json();

              if (json?.success) {
                const chainItems = innerData(json.data ?? json);
                const assets: any[] = [];
                chainItems.forEach((ci: any) => {
                  if (Array.isArray(ci?.tokenAssets))
                    assets.push(...ci.tokenAssets);
                });

                assets.forEach((a) => {
                  let addr = normalizeAddress(
                    a.symbol ?? a.tokenSymbol ?? "",
                    a.tokenContractAddress,
                  );
                  if (!addr) {
                    addr = normalizeAddress(
                      a.symbol ?? a.tokenSymbol ?? "",
                      a.address,
                    );
                  }
                  if (!addr) return;

                  let assetSymbol = (
                    a.symbol ??
                    a.tokenSymbol ??
                    "UNK"
                  ).toUpperCase();
                  if (
                    assetSymbol === "SOL" &&
                    addr.toLowerCase() === CHAIN_INDEX_MAP["SOL"].toLowerCase()
                  ) {
                    assetSymbol = "WSOL";
                  }

                  const balanceStr = (a.balance ?? "0").toString();
                  const key = addr.toLowerCase();

                  if (tokenMap.has(key)) {
                    const existing = tokenMap.get(key)!;
                    const combined = (
                      Number(existing.balance ?? 0) + Number(balanceStr)
                    ).toString();
                    tokenMap.set(key, { ...existing, balance: combined });
                  } else {
                    tokenMap.set(key, {
                      symbol: assetSymbol,
                      name: a.tokenName ?? a.name ?? assetSymbol,
                      address: addr,
                      decimals: Number(a.decimals ?? 0),
                      logoUrl: a.tokenLogoUrl,
                      hasLogo: !!a.tokenLogoUrl,
                      balance: balanceStr,
                    });
                  }
                });
              }
            } catch {
              /* ignore balance errors */
            }
          }

          const merged: SwapToken[] = Array.from(tokenMap.values()).sort(
            (a, b) => {
              const ba = Number(a.balance ?? 0);
              const bb = Number(b.balance ?? 0);
              if (ba === bb) return a.symbol.localeCompare(b.symbol);
              return bb - ba;
            },
          );

          /* Defaults only on first load */
          if (!G.tokensLoaded) {
            const sol =
              merged.find((t) => Number(t.balance ?? 0) > 0) ??
              merged.find((t) => t.symbol === "SOL") ??
              merged[0];
            G.fromToken = G.fromToken ?? sol;
            const next =
              G.toToken ??
              merged.find(
                (t) =>
                  t.address !== sol.address && Number(t.balance ?? 0) === 0,
              ) ??
              merged[1] ??
              merged[0];
            G.toToken = next;
          }

          /* Write cache */
          G.tokens = merged;
          G.tokensLoaded = true;
          G.tokensError = null;

          /* Sync local */
          setTokens(merged);
          setFromToken(G.fromToken);
          setToToken(G.toToken);
        } catch (e: any) {
          const msg = e.message || "Token list error";
          G.tokensError = msg;
          setTokensError(msg);
        } finally {
          setTokensLoading(false);
          inFlight.current = null;
        }
      })();

      inFlight.current = task;
      return task;
    },
    [connected, publicKey],
  );

  /* --------------------------- lifecycle hooks --------------------------- */

  useEffect(() => void loadTokens(), []);
  useEffect(() => {
    if (connected && publicKey) void loadTokens();
  }, [connected, publicKey, loadTokens]);

  const refreshTokens = () => void loadTokens(true);

  /* Sync state changes back to global cache */
  useEffect(() => {
    G.fromToken = fromToken;
  }, [fromToken]);
  useEffect(() => {
    G.toToken = toToken;
  }, [toToken]);
  useEffect(() => {
    G.fromAmount = fromAmount;
  }, [fromAmount]);
  useEffect(() => {
    G.toAmount = toAmount;
  }, [toAmount]);
  useEffect(() => {
    G.slippage = slippage;
  }, [slippage]);
  useEffect(() => {
    G.quote = quote;
  }, [quote]);
  useEffect(() => {
    G.execute = execute;
  }, [execute]);

  useEffect(() => {
    setQuote(null);
    setToAmount("");
  }, [fromToken, toToken]);

  const hasValidInputs = () =>
    !!fromToken &&
    !!toToken &&
    fromToken.address !== toToken.address &&
    parseFloat(fromAmount) > 0;

  const requireInputs = (needsWallet = false) => {
    if (!hasValidInputs()) {
      setError("Enter valid inputs");
      return false;
    }
    if (needsWallet && (!connected || !publicKey)) {
      setError("Connect your wallet");
      return false;
    }
    const slip = parseFloat(slippage);
    if (Number.isNaN(slip) || slip < 0.1 || slip > 100) {
      setError("Slippage must be between 0.1 and 100");
      return false;
    }
    return true;
  };

  const swapTokens = () => {
    if (!fromToken || !toToken) return;
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    setQuote(null);
    setExecute(null);
  };

  function extractQuotePayload(raw: any): any | null {
    if (!raw?.data) return null;
    if (Array.isArray(raw.data)) return raw.data[0] ?? null;
    if (raw.data?.data?.data?.length) return raw.data.data.data[0];
    if (raw.data?.data?.length) return raw.data.data[0];
    return null;
  }

  const getQuote = async () => {
    if (!requireInputs(false)) return;

    setQuoting(true);
    setError(null);
    setQuote(null);
    setExecute(null);

    try {
      const body = {
        action: "quote",
        chainIndex: CHAIN_INDEX_MAP["SOL"],
        chainId: CHAIN_INDEX_MAP["SOL"],
        fromTokenAddress: fromToken!.address,
        toTokenAddress: toToken!.address,
        amount: toRawAmount(fromAmount, fromToken!.decimals),
        slippage,
      };

      const res = await fetch("/api/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.details || "Quote failed");

      const q = extractQuotePayload(json);
      if (!q) throw new Error("Malformed quote response");
      setQuote(q);

      if (q?.toTokenAmount) {
        setToAmount(fromRawAmount(q.toTokenAmount, toToken!.decimals, 6));
      }
    } catch (e: any) {
      setError(e.message || "Quote error");
    } finally {
      setQuoting(false);
    }
  };

  const extractTransactionString = (raw: any): string | null => {
    if (!raw) return null;

    if (typeof raw === "string") return raw;
    if (typeof raw.swapTransaction === "string") return raw.swapTransaction;
    if (typeof raw.transaction === "string") return raw.transaction;

    if (raw.tx) {
      const inner = raw.tx;
      if (typeof inner === "string") return inner;
      if (typeof inner.swapTransaction === "string")
        return inner.swapTransaction;
      if (typeof inner.data === "string") return inner.data;
    }

    if (Array.isArray(raw)) {
      for (const entry of raw) {
        const found = extractTransactionString(entry);
        if (found) return found;
      }
    }

    if (typeof raw.data === "string") return raw.data;
    if (raw.data) {
      const found = extractTransactionString(raw.data);
      if (found) return found;
    }

    return null;
  };

  const executeSwap = async () => {
    if (!requireInputs(true)) return;
    if (!connection) {
      setError("No Solana connection");
      return;
    }

    setExecuting(true);
    setError(null);
    setExecute(null);

    try {
      /* Always use the latest user-provided amount */
      const rawAmount = toRawAmount(fromAmount, fromToken!.decimals);

      const body = {
        action: "execute",
        chainIndex: CHAIN_INDEX_MAP["SOL"],
        chainId: CHAIN_INDEX_MAP["SOL"],
        fromTokenAddress: fromToken!.address,
        toTokenAddress: toToken!.address,
        amount: rawAmount,
        slippage,
        userWalletAddress: publicKey!,
      };

      const res = await fetch("/api/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.details || "Execution failed");

      const txStr = extractTransactionString(json.data);
      if (!txStr) throw new Error("No transaction payload returned");

      /* Decode + sign */
      const decoded = bs58.decode(txStr.trim());
      const { blockhash } = await connection.getLatestBlockhash();
      let tx: Transaction | VersionedTransaction;

      try {
        tx = VersionedTransaction.deserialize(decoded);
        tx.message.recentBlockhash = blockhash;
      } catch {
        tx = Transaction.from(Buffer.from(decoded));
        tx.recentBlockhash = blockhash;
      }

      const signature = await walletSendTx(tx as any, connection);
      await connection.confirmTransaction(signature, "confirmed");

      const execObj = {
        ...json.data,
        transactionId: signature,
        explorerUrl: `https://solscan.io/tx/${signature}`,
      };
      setExecute(execObj);
      setError(null);
      void loadTokens(true);
    } catch (e: any) {
      setError(e.message || "Execution error");
    } finally {
      setExecuting(false);
    }
  };

  /* ----------------------------- Returned API ---------------------------- */

  return {
    tokens,
    tokensLoading,
    tokensError,
    refreshTokens,
    fromToken: fromToken as SwapToken,
    toToken: toToken as SwapToken,
    setFromToken,
    setToToken,
    swapTokens,
    fromAmount,
    setFromAmount,
    toAmount,
    slippage,
    setSlippage,
    quoting,
    quote,
    getQuote,
    executing,
    execute,
    executeSwap,
    error,
  };
}
