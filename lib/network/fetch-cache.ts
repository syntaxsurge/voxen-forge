import { sleep } from "@/lib/utils";

/**
 * In-memory JSON fetch with deduplication and expiry.
 *
 * Example:
 *   const data = await fetchCachedJson("/api/token-catalog?chainIndex=501");
 */
type CacheEntry = {
  timestamp: number;
  data: any | null;
  promise: Promise<any> | null;
};

const CACHE = new Map<string, CacheEntry>();

interface FetchCacheOpts {
  expiryMs?: number; // default 5 minutes
  force?: boolean; // bypass cache and re-fetch
}

export async function fetchCachedJson<T = any>(
  url: string,
  opts: FetchCacheOpts = {},
): Promise<T> {
  const { expiryMs = 300_000, force = false } = opts;
  const existing = CACHE.get(url);
  const fresh = existing && Date.now() - existing.timestamp < expiryMs;

  if (!force && existing) {
    if (existing.data && fresh) return existing.data as T;
    if (existing.promise) return existing.promise as Promise<T>;
  }

  const promise = (async () => {
    // Tiny stagger to reduce double fire in strict-mode dev
    if (existing?.promise) await sleep(25);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const json = await res.json();
    CACHE.set(url, { timestamp: Date.now(), data: json, promise: null });
    return json as T;
  })();

  CACHE.set(url, { timestamp: Date.now(), data: null, promise });
  return promise;
}
