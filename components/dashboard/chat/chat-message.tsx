"use client";

import { Bot, User, Activity, BarChart3, RefreshCw } from "lucide-react";

import type { AiChatMessage } from "@/lib/ai/chat-ui";
import { markdownToHtml, cn } from "@/lib/utils";

import ChartCard from "./cards/chart-card";
import PriceCard from "./cards/price-card";
import RecentTradesCard from "./cards/recent-trades-card";
import TokenBalanceCard from "./cards/token-balance-card";
import TransactionHistoryCard from "./cards/transaction-history-card";
import EmptyCard from "./empty-card";

interface Props {
  message: AiChatMessage;
}

export default function ChatMessage({ message }: Props) {
  const { role, content } = message;

  /* --------------------------- charts & tables --------------------------- */
  if (content === "CHART_DATA") {
    const chart = message.chartData;
    if (chart?.data?.length) {
      return (
        <ChartCard
          title={message.chartTitle || message.tokenName || "Chart"}
          chartData={chart}
          summary={message.summary}
        />
      );
    }
    return (
      <EmptyCard
        icon={BarChart3}
        title={message.chartTitle || "Chart"}
        subtitle="Chart rendering is simplified in this view"
      />
    );
  }

  if (content === "TRANSACTION_DATA") {
    const txs = message.transactionData ?? [];
    if (txs.length) {
      return (
        <TransactionHistoryCard
          title={message.chartTitle || "Recent Transactions"}
          transactions={txs}
          summary={message.summary}
        />
      );
    }
    return (
      <EmptyCard
        icon={Activity}
        title={message.chartTitle || "Transactions"}
        subtitle="No recent transactions found"
      />
    );
  }

  if (content === "TOKEN_BALANCE") {
    const balances = message.balanceData ?? [];
    if (balances.length) {
      return (
        <TokenBalanceCard
          title={message.chartTitle || "Token Balances"}
          balances={balances}
          summary={message.summary}
        />
      );
    }
    return (
      <EmptyCard
        icon={BarChart3}
        title={message.chartTitle || "Token Balances"}
        subtitle="No token balances found"
      />
    );
  }

  if (content === "TRADE_DATA") {
    const trades = message.tradeData ?? [];
    if (trades.length) {
      return (
        <RecentTradesCard
          title={message.chartTitle || "Recent Trades"}
          trades={trades}
          summary={message.summary}
        />
      );
    }
    return (
      <EmptyCard
        icon={BarChart3}
        title={message.chartTitle || "Recent Trades"}
        subtitle="No trades found"
      />
    );
  }

  if (content === "PRICE_DATA") {
    return (
      <PriceCard
        title={message.chartTitle || "Token Price"}
        price={message.price || "0"}
        summary={message.summary}
      />
    );
  }

  if (content === "API_REQUEST") {
    return (
      <EmptyCard
        icon={RefreshCw}
        title={message.chartTitle || "Fetching data"}
        subtitle="Querying API…"
      />
    );
  }

  /* ---------------------------- chat bubble ----------------------------- */
  const bubbleClass = cn(
    "py-3 px-4 rounded-2xl whitespace-pre-wrap border",
    role === "user"
      ? "bg-muted/10 border-border"
      : "dark:bg-black/30 bg-muted/20 border-border",
  );

  return (
    <div
      className={`flex ${role === "user" ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`flex max-w-[80%] ${
          role === "user" ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div
          className={`rounded-full h-9 w-9 flex items-center justify-center bg-muted/20 dark:bg-white/10 border border-border dark:border-white/10 ${
            role === "user" ? "ml-2" : "mr-2"
          }`}
        >
          {role === "user" ? (
            <User className="h-4 w-4 text-foreground/80 dark:text-white/80" />
          ) : (
            <Bot className="h-4 w-4 text-foreground/80 dark:text-white/80" />
          )}
        </div>
        <div className={bubbleClass}>
          {role === "user" ? (
            content
          ) : (
            <div
              className="prose prose-invert text-white"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
