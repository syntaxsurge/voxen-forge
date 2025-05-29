/**
 * Queue-aware signed helpers for the OKX Web3 API.
 *
 * These thin wrappers delegate to {@link OkxClient.query}, which serialises
 * every request through a singleton {@link OkxRequestQueue}.  The queue
 * enforces—at a process level—**one in-flight request at a time** and applies
 * an exponential back-off retry policy for HTTP 429 and 5xx responses using
 * the thresholds configured in {@link import("@/lib/config").request}.  As a
 * result, **API routes and hooks must not implement their own delay/retry
 * logic**—simply call {@link signedGet} or {@link signedPost}.
 */

import { okx } from "@/lib/config";
import { OkxClient } from "@/lib/network/okx-client";

/** Injects the `OK-ACCESS-PROJECT` header when a projectId is configured. */
function projectHeader(): Record<string, string> | undefined {
  return okx.projectId ? { "OK-ACCESS-PROJECT": okx.projectId } : undefined;
}

/**
 * Perform a signed GET request.
 * @param path  Endpoint path beginning with `/api/`
 * @param query Optional query-string parameters
 */
export function signedGet<T = any>(
  path: string,
  query?: Record<string, string>,
): Promise<T> {
  return OkxClient.query<T>("GET", path, query, undefined, projectHeader());
}

/**
 * Perform a signed POST request.
 * @param path Endpoint path beginning with `/api/`
 * @param body JSON-serialisable request payload
 */
export function signedPost<T = any>(path: string, body?: unknown): Promise<T> {
  return OkxClient.query<T>("POST", path, undefined, body, projectHeader());
}
