import crypto from "crypto";

import { okx } from "@/lib/config";
import { OkxRequestQueue, HttpStatusError } from "@/lib/network/request-queue";

type HttpMethod = "GET" | "POST";

/**
 * Thin OKX HTTP client.
 * All network activity is funnelled through OkxRequestQueue to
 * respect rate-limits and apply automatic retries.
 */
class OkxClientClass {
  /* -------------------------------------------------------------------- */
  /*                            Signatures                                */
  /* -------------------------------------------------------------------- */

  private buildSignature(
    timestamp: string,
    method: HttpMethod,
    requestPath: string,
    queryString = "",
    body = "",
  ): string {
    const message = timestamp + method + requestPath + queryString + body;
    return crypto
      .createHmac("sha256", okx.secretKey)
      .update(message)
      .digest("base64");
  }

  private buildHeaders(
    signature: string,
    timestamp: string,
    extraHeaders?: Record<string, string>,
  ) {
    return {
      "Content-Type": "application/json",
      "OK-ACCESS-KEY": okx.apiKey,
      "OK-ACCESS-SIGN": signature,
      "OK-ACCESS-TIMESTAMP": timestamp,
      "OK-ACCESS-PASSPHRASE": okx.passphrase,
      ...(extraHeaders ?? {}),
    };
  }

  /* -------------------------------------------------------------------- */
  /*                       Low-level fetch operation                       */
  /* -------------------------------------------------------------------- */

  private async rawFetch<T = any>(
    method: HttpMethod,
    path: string,
    query?: Record<string, string>,
    body?: unknown,
    extraHeaders?: Record<string, string>,
  ): Promise<T> {
    const queryString =
      query && Object.keys(query).length
        ? `?${new URLSearchParams(query).toString()}`
        : "";
    const bodyString = method === "POST" && body ? JSON.stringify(body) : "";

    const timestamp = new Date().toISOString();
    const signature = this.buildSignature(
      timestamp,
      method,
      path,
      queryString,
      bodyString,
    );
    const headers = this.buildHeaders(signature, timestamp, extraHeaders);

    const res = await fetch(okx.baseUrl + path + queryString, {
      method,
      headers,
      body: method === "POST" ? bodyString : undefined,
    });

    if (!res.ok) {
      throw new HttpStatusError(
        res.status,
        `OKX API Error: ${res.status} ${res.statusText}`,
      );
    }
    return (await res.json()) as T;
  }

  /* -------------------------------------------------------------------- */
  /*                        Public query interface                         */
  /* -------------------------------------------------------------------- */

  public async query<T = any>(
    method: HttpMethod,
    path: string,
    query?: Record<string, string>,
    body?: unknown,
    extraHeaders?: Record<string, string>,
  ): Promise<T> {
    // Serialise via the request queue
    return OkxRequestQueue.run<T>(() =>
      this.rawFetch(method, path, query, body, extraHeaders),
    );
  }
}

/** Export singleton */
export const OkxClient = new OkxClientClass();
