import { clsx, type ClassValue } from "clsx";
import { marked } from "marked";
import { twMerge } from "tailwind-merge";

import { NATIVE_SOL_ADDRESS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function compact<T extends Record<string, any>>(
  obj: T,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => [k, String(v)]),
  );
}

export function formatCurrency(v: string | number): string {
  const n = Number(v);
  if (Number.isNaN(n) || n === 0) return "$0.00";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function toRawAmount(amount: string, decimals: number): string {
  return Math.floor(parseFloat(amount || "0") * 10 ** decimals).toString();
}

export function fromRawAmount(
  raw: string,
  decimals: number,
  precision = 6,
): string {
  return (parseFloat(raw || "0") / 10 ** decimals).toFixed(precision);
}

export const tokenGradients: Record<string, string> = {
  SOL: "bg-gradient-to-r from-purple-500 to-blue-500",
  ETH: "bg-gradient-to-r from-blue-600 to-purple-600",
  USDC: "bg-blue-500",
  USDT: "bg-green-500",
  RAY: "bg-gradient-to-r from-blue-400 to-purple-500",
  ORCA: "bg-gradient-to-r from-pink-400 to-purple-500",
  WBTC: "bg-orange-500",
  DAI: "bg-yellow-500",
  BNB: "bg-gradient-to-r from-yellow-500 to-orange-500",
  MATIC: "bg-gradient-to-r from-purple-600 to-pink-500",
  AVAX: "bg-gradient-to-r from-red-600 to-orange-500",
  FTM: "bg-gradient-to-r from-blue-400 to-cyan-400",
};

export function getTokenGradient(symbol: string): string {
  return tokenGradients[symbol] || "bg-gradient-to-r from-gray-500 to-gray-600";
}

export function shortAddress(addr: string, head = 6, tail = 4): string {
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

export function markdownToHtml(markdown: string): string | Promise<string> {
  return marked.parse(markdown);
}

/**
 * Returns a human-friendly symbol name, converting wrapped SOL to "WSOL".
 */
export function displaySymbol(symbol: string, address?: string): string {
  const sym = (symbol ?? "").toUpperCase();
  if (sym === "SOL" && address && address !== NATIVE_SOL_ADDRESS) {
    return "WSOL";
  }
  return sym;
}

/**
 * Formats token amounts with sensible precision while avoiding the
 * misleading "0.000000" output for tiny values shown in tables.
 */
export function formatTokenAmount(v: string | number, maxDecimals = 6): string {
  const n = Number(v);
  if (Number.isNaN(n)) return "0";
  if (Math.abs(n) >= 1) {
    return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }
  if (Math.abs(n) >= 1 / 10 ** maxDecimals) {
    return n.toFixed(maxDecimals).replace(/\.?0+$/, "");
  }
  return n.toPrecision(3);
}
