"use client";

import { useState } from "react";

import { INITIAL_GREETING } from "@/lib/ai/chat-constants";
import type { AiChatMessage } from "@/lib/ai/chat-ui";
import {
  callMarketDataApi,
  innerData,
  extractPrice,
  formatTokenBalanceTable,
} from "@/lib/ai/chat-utils";
import { useWallet } from "@/lib/contexts/wallet-context";
import { openaiAgent, chatWithContext } from "@/lib/openai";

import { chainList } from "../constants";

/* -------------------------------------------------------------------------- */

const BALANCE_TYPES = new Set([
  "token_balance",
  "token_balances",
  "specific_token_balance",
  "total_token_balance",
  "total_token_balances",
]);

/* -------------------------------------------------------------------------- */

export interface UseAiChat {
  messages: AiChatMessage[];
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  send: () => Promise<void>;
  reset: () => void;
}

export function useAiChat(): UseAiChat {
  const { publicKey } = useWallet();
  const [messages, setMessages] = useState<AiChatMessage[]>([INITIAL_GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const append = (m: AiChatMessage) => setMessages((prev) => [...prev, m]);
  const reset = () => setMessages([INITIAL_GREETING]);

  /* ---------------------------------------------------------------------- */
  /*                                 Send                                   */
  /* ---------------------------------------------------------------------- */
  const send = async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;

    append({ role: "user", content: prompt });
    setInput("");
    setLoading(true);

    const placeholder: AiChatMessage = {
      role: "system",
      content: "API_REQUEST",
      chartTitle: "Fetching data",
    };
    setMessages((p) => [...p, placeholder]);

    try {
      const spec = await openaiAgent(prompt);
      let tokenName: string | undefined =
        (spec as any)?.token_name?.toString() || undefined;
      const type = (spec as any)?.type as string;
      const txHash = (spec as any)?.transaction_hash ?? "";

      if (!type || type === "general_answer") {
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.content === "API_REQUEST");
          const next = [...prev];
          next[idx] = {
            role: "system",
            content:
              typeof (spec as any)?.message === "string"
                ? (spec as any).message
                : "I’m not sure how to help with that.",
          };
          return next;
        });
        return;
      }

      /* Default to SOL and normalise to uppercase */
      if (
        !tokenName &&
        !["supported_chains", "total_value", "portfolio_value"].includes(type)
      ) {
        tokenName = "SOL";
      }
      if (tokenName) tokenName = tokenName.toUpperCase();

      const apiData = await callMarketDataApi(
        type,
        tokenName || "",
        publicKey || "",
        txHash,
      );

      /* -------- Build context string and AI summary -------------------- */
      let contextStr = "";
      let aiSummary = "";

      if (BALANCE_TYPES.has(type)) {
        const rawBalances = innerData(apiData)[0]?.tokenAssets ?? [];
        const topBalances = [...rawBalances]
          .sort(
            (a, b) =>
              Number(b.balance) * Number(b.tokenPrice) -
              Number(a.balance) * Number(a.tokenPrice),
          )
          .slice(0, 10);

        contextStr = formatTokenBalanceTable(topBalances);
        (apiData as any).__vf_topBalances = topBalances;
      } else {
        contextStr = JSON.stringify(apiData, null, 2);
      }

      aiSummary = await chatWithContext(prompt, contextStr);

      const final: AiChatMessage[] = [];

      if (type === "supported_chains") {
        final.push({
          role: "system",
          content:
            "Supported blockchains: " + chainList.map((c) => c.name).join(", "),
        });
      } else if (type === "total_value" || type === "portfolio_value") {
        const tv = apiData?.data?.totalValue ?? apiData?.totalValue ?? null;
        final.push({
          role: "system",
          content: tv !== null ? aiSummary : "Portfolio value unavailable.",
        });
      } else if (type === "transaction_history") {
        const txs = innerData(apiData)[0]?.transactions ?? [];
        final.push({
          role: "system",
          content: "TRANSACTION_DATA",
          chartTitle: "Recent Transactions",
          transactionData: txs,
          summary: aiSummary,
        });
      } else if (BALANCE_TYPES.has(type)) {
        const balances =
          (apiData as any).__vf_topBalances ??
          innerData(apiData)[0]?.tokenAssets ??
          [];
        final.push({
          role: "system",
          content: "TOKEN_BALANCE",
          chartTitle: "Token Balances",
          balanceData: balances,
          summary: aiSummary,
        });
      } else if (type === "trades") {
        const trades = innerData(apiData);
        final.push({
          role: "system",
          content: "TRADE_DATA",
          chartTitle: `Recent ${tokenName} Trades`,
          tradeData: trades,
          summary: aiSummary,
        });
      } else if (
        type === "candlestick" ||
        type === "hist_data" ||
        type === "candlestick_history"
      ) {
        final.push({
          role: "system",
          content: "CHART_DATA",
          chartType: type,
          chartTitle: tokenName,
          tokenName,
          chartData: { data: innerData(apiData) },
          summary: aiSummary,
        });
      } else if (type === "price" || type === "token_index_price") {
        const priceNum = extractPrice(apiData);
        final.push({
          role: "system",
          content: "PRICE_DATA",
          chartTitle: `${tokenName} Price`,
          tokenName,
          price: priceNum !== null ? priceNum.toString() : "0",
          summary: aiSummary,
        });
      } else {
        final.push({ role: "system", content: aiSummary });
      }

      /* Replace placeholder message with final card/text ----------------- */
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.content === "API_REQUEST");
        const next = [...prev];
        next.splice(idx, 1, ...final);
        return next;
      });
    } catch (err: any) {
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.content === "API_REQUEST");
        const next = [...prev];
        next[idx] = { role: "system", content: `Error: ${err.message}` };
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------------------- */

  return { messages, input, setInput, loading, send, reset };
}
