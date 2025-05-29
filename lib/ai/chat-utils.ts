import { compact } from "@/lib/utils";

import { chainList } from "../constants";

export const TOKEN_ADDRESS_MAP: Record<string, string> = {
  ETH: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  OP: "0x4200000000000000000000000000000000000042",
  BSC: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  OKT: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  SONIC: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  XLAYER: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  POLYGON: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  ARB: "0x912CE59144191C1204E64559FE8253a0e49E6548",
  AVAX: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  ZKSYNC: "0x5A7d6b2F92C77FAD6CCaBd7EE0624E64907Eaf3E",
  POLYZKEVM: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  BASE: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  LINEA: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  FTM: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  MANTLE: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  CFX: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  METIS: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  MERLIN: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  BLAST: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  MANTA: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  SCROLL: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  CRO: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  ZETA: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  TRON: "TRX",
  SOL: "So11111111111111111111111111111111111111112",
  SUI: "0x2::sui::SUI",
  TON: "0x582d872a1b094fc48f5de31d3b73f2d9be47def1",
  MYS: "3",
};

export const CHAIN_INDEX_MAP: Record<string, string> = {
  ETH: "1",
  OP: "10",
  BSC: "56",
  OKT: "66",
  SONIC: "146",
  XLAYER: "196",
  POLYGON: "137",
  ARB: "42161",
  AVAX: "43114",
  ZKSYNC: "324",
  POLYZKEVM: "1101",
  BASE: "8453",
  LINEA: "59144",
  FTM: "250",
  MANTLE: "5000",
  CFX: "1030",
  METIS: "1088",
  MERLIN: "4200",
  BLAST: "81457",
  MANTA: "169",
  SCROLL: "534352",
  CRO: "25",
  ZETA: "7000",
  TRON: "195",
  SOL: "501",
  SUI: "784",
  TON: "607",
  MYS: "3",
};

export function nfmt(n: number, d = 2): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: d });
}

export function pct(newer: number, older: number): number {
  return older !== 0 ? ((newer - older) / older) * 100 : 0;
}

export function innerData(api: any): any[] {
  if (!api || typeof api !== "object") return [];
  const d1 = api.data;
  const d2 = d1?.data;
  if (Array.isArray(d2)) return d2;
  if (Array.isArray(d1)) return d1;
  if (d1 && typeof d1 === "object") return [d1];
  return [];
}

export function extractPrice(api: any): number | null {
  const rows = innerData(api);
  const first: any = rows[0] ?? {};
  const raw =
    first.price ?? first.tokenIndexPrice ?? first.currentPrice ?? null;
  const num = Number(raw);
  return Number.isFinite(num) && num > 0 ? num : null;
}

export function summarisePrice(api: any, symbol = "SOL"): string | null {
  const priceNum = extractPrice(api);
  if (priceNum === null) return null;
  return `${symbol} trades at $${nfmt(priceNum, 3)}.`;
}

export function summariseTrades(trades: any[], symbol = "SOL"): string {
  if (!trades.length) return "No recent trades found.";
  const display = trades
    .slice(0, 5)
    .map((t: any) => {
      const price = Number(t.price ?? t.tradePrice ?? t.rate ?? 0);
      const sizeRaw =
        t.baseSize ??
        t.size ??
        t.baseAmount ??
        t.amount ??
        t.qty ??
        t.quantity ??
        0;
      const size = Number(sizeRaw);
      return `• $${nfmt(price, 4)} @ ${nfmt(size, 4)} ${symbol}`;
    })
    .join("\n");
  return `Most recent trades for ${symbol}:\n${display}`;
}

export function summariseBalances(balances: any[]): string {
  if (!balances.length) return "No token balances found.";
  const totalVal = balances.reduce(
    (t, b) => t + Number(b.balance) * Number(b.tokenPrice),
    0,
  );
  const top = [...balances]
    .sort(
      (a, b) =>
        Number(b.balance) * Number(b.tokenPrice) -
        Number(a.balance) * Number(a.tokenPrice),
    )
    .slice(0, 3)
    .map(
      (b) =>
        `${b.symbol}: $${nfmt(Number(b.balance) * Number(b.tokenPrice), 2)}`,
    )
    .join(", ");
  return `Estimated portfolio value ≈ $${nfmt(
    totalVal,
    2,
  )}. Top holdings → ${top}.`;
}

export function summariseTransactions(txs: any[]): string {
  if (!txs.length) return "No recent transactions.";
  const deposits = txs.filter((t: any) => Number(t.amount) > 0).length;
  const withdraws = txs.length - deposits;
  return `Last ${txs.length} transactions: ${deposits} inflow, ${withdraws} outflow.`;
}

export function summariseCandle(api: any, symbol = "SOL"): string | null {
  const rows: any[] = innerData(api);
  if (rows.length < 2) return null;
  const latest = rows[rows.length - 1];
  const prev = rows[rows.length - 2];
  const closeNow = Number(latest[4]);
  const closePrev = Number(prev[4]);
  const changePct = pct(closeNow, closePrev);
  return `${symbol} closed at $${nfmt(
    closeNow,
    3,
  )} (${changePct >= 0 ? "+" : ""}${nfmt(changePct, 2)}%).`;
}

/* -------------------- NEW: balance table formatter ---------------------- */

export function formatTokenBalanceTable(balances: any[]): string {
  const header = `Token Balances (${balances.length})\nToken\tBalance\tPrice\tValue`;
  const rows = balances.map((b) => {
    const bal = Number(b.balance ?? 0).toLocaleString(undefined, {
      maximumFractionDigits: 6,
    });
    const priceNum = Number(b.tokenPrice ?? 0);
    const price = `$${priceNum.toLocaleString(undefined, {
      maximumFractionDigits: 4,
    })}`;
    const value = `$${(Number(b.balance ?? 0) * priceNum).toLocaleString(
      undefined,
      { maximumFractionDigits: 2 },
    )}`;
    return `${b.symbol}\t${bal}\t${price}\t${value}`;
  });
  return [header, ...rows].join("\n");
}

export function getTokenContractAddress(token: string): string | null {
  return TOKEN_ADDRESS_MAP[token] ?? null;
}

async function postJson<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function callMarketDataApi(
  type: string,
  tokenName: string,
  address = "",
  txHash = "",
): Promise<any> {
  if (type === "supported_chains") {
    return { data: chainList };
  }

  let chainIndex: string | undefined = tokenName
    ? CHAIN_INDEX_MAP[tokenName]
    : undefined;

  if (
    (!chainIndex || chainIndex === "") &&
    (type === "total_value" || type === "portfolio_value")
  ) {
    chainIndex = CHAIN_INDEX_MAP["SOL"];
  }

  const tokenContractAddress =
    tokenName && TOKEN_ADDRESS_MAP[tokenName]
      ? TOKEN_ADDRESS_MAP[tokenName]
      : undefined;

  switch (type) {
    case "total_value":
    case "portfolio_value":
      return postJson("/api/portfolio/token-value", {
        address,
        chains: chainIndex,
        excludeRiskToken: "0",
      });

    case "token_balance":
    case "token_balances":
    case "total_token_balance":
    case "total_token_balances":
      return postJson("/api/portfolio/token-balances", {
        address,
        chains: chainIndex,
        excludeRiskToken: "0",
      });

    case "specific_token_balance":
      return postJson("/api/portfolio/token-balance", {
        address,
        tokenContractAddresses: [
          { chainIndex: chainIndex ?? "", tokenContractAddress },
        ],
        excludeRiskToken: "0",
      });

    case "transaction_history":
      return postJson("/api/portfolio/history", {
        address,
        chains: chainIndex,
        limit: "10",
      });

    case "tx_by_hash":
      return postJson("/api/portfolio/transaction-detail", {
        chainIndex,
        txHash,
      });
  }

  const pathMap: Record<string, string> = {
    price: "/api/v5/dex/market/price-info",
    trades: "/api/v5/dex/market/trades",
    candlestick: "/api/v5/dex/market/candles",
    hist_data: "/api/v5/dex/index/historical-price",
    batch_price: "/api/v5/dex/market/price-info",
    candlestick_history: "/api/v5/dex/market/historical-candles",
    historical_index_price: "/api/v5/dex/index/historical-price",
    token_index_price: "/api/v5/dex/index/current-price",
  };

  const path = pathMap[type];
  if (!path) throw new Error(`Unsupported market-data type: ${type}`);

  const getTypes = new Set([
    "trades",
    "candlestick",
    "candlestick_history",
    "hist_data",
    "historical_index_price",
  ]);

  const method: "GET" | "POST" = getTypes.has(type) ? "GET" : "POST";

  let payload: any;
  if (
    type === "price" ||
    type === "batch_price" ||
    type === "token_index_price"
  ) {
    payload = [
      {
        chainIndex,
        tokenContractAddress,
      },
    ];
  } else {
    payload = compact({
      chainIndex,
      address: method === "POST" ? address : undefined,
      tokenContractAddress,
    });
  }

  return postJson("/api/market-data", { method, path, data: payload });
}
