/* AI chat UI helpers and message types (updated) */

/* -------------------------------------------------------------------------- */
/*                             Default suggestions                            */
/* -------------------------------------------------------------------------- */

export const SUGGESTIONS: string[] = [
  /* Wallet & Portfolio */
  "How much SOL is in my wallet?",
  "Summarize my portfolio total value",
  "List my token balances",
  "Show my last 10 transactions",

  /* Market Data */
  "What's the current price of SOL?",
  "Plot recent SOL candlestick chart",
  "Fetch SOL index price now",
  "Highlight recent SOL trades",

  /* Metadata & Capability */
  "Which blockchains does Voxen Forge support?",

  /* General (no API call required) */
  "Explain how cross-chain swaps work",
  "How does Voxen Forge save on gas fees?",
  "Explain the sentiment radar module",
];

/* -------------------------------------------------------------------------- */
/*                            Formatting utilities                            */
/* -------------------------------------------------------------------------- */

export function formatTimestamp(ts: string | number): string {
  const d = new Date(Number(ts));
  return (
    d.toLocaleDateString() +
    " " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

export function formatPrice(v: string | number): string {
  return Number(v).toFixed(6);
}

export function formatPriceAxis(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(2)}`;
}

/* -------------------------------------------------------------------------- */
/*                               Message types                                */
/* -------------------------------------------------------------------------- */

export interface AiChatMessage {
  role: "user" | "system";
  content: string;
  chartData?: any;
  chartType?: string;
  chartTitle?: string;
  tokenName?: string;
  transactionData?: any[];
  balanceData?: any[];
  tradeData?: any[]; // NEW — array of trade rows from OKX API
  price?: string;
  summary?: string;
}
