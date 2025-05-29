function requireEnv(key: string): string {
  if (typeof window !== "undefined") {
    return process.env[key] ?? "";
  }
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const okx = Object.freeze({
  baseUrl: "https://web3.okx.com",
  apiKey: requireEnv("OKX_DEX_API_KEY"),
  secretKey: requireEnv("OKX_DEX_SECRET_KEY"),
  passphrase: requireEnv("OKX_DEX_PASSPHRASE"),
  projectId: process.env.OKX_DEX_PROJECT_ID ?? "",
});

export const solana = Object.freeze({
  rpcUrl:
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? process.env.SOLANA_RPC_URL ?? "",
});

export const request = Object.freeze({
  minDelayMs: Number.parseInt(process.env.REQUEST_MIN_DELAY_MS ?? "1000", 10),
  retryDelayMs: Number.parseInt(
    process.env.REQUEST_RETRY_DELAY_MS ?? "5000",
    10,
  ),
  maxRetries: Number.parseInt(process.env.REQUEST_MAX_RETRIES ?? "5", 10),
});
