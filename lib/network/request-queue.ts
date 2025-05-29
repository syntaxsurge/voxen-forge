/**
 * OkxRequestQueue — serial-execution queue with exponential back-off.
 *
 * All outbound calls to the OKX API must be wrapped with
 *   OkxRequestQueue.run(() => fetch(…))
 * to ensure only one request is in flight at any time and that
 * 429/5xx responses are retried using an exponential delay.
 */

import { request as cfg } from "@/lib/config";

/** Generic HTTP status error carrying a numeric status code */
export class HttpStatusError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "HttpStatusError";
  }
}

/**
 * Lightweight singleton queue.
 * Guarantees serial execution and automatic retry/back-off.
 */
class OkxRequestQueueClass {
  private queue: Array<() => Promise<void>> = [];
  private active = false;

  /** Enqueue an async task and await its result */
  run<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        const outcome = await this.execute(task);
        outcome.ok ? resolve(outcome.value) : reject(outcome.error);
      });
      // Kick off processing if idle
      void this.flush();
    });
  }

  /* ---------------------------------------------------------------------- */
  /*                             Internal logic                              */
  /* ---------------------------------------------------------------------- */

  private async flush(): Promise<void> {
    if (this.active) return;
    this.active = true;
    while (this.queue.length) {
      const job = this.queue.shift()!;
      await job();
    }
    this.active = false;
  }

  private async execute<T>(
    task: () => Promise<T>,
  ): Promise<{ ok: true; value: T } | { ok: false; error: any }> {
    const maxRetries = cfg.maxRetries ?? 3;
    let attempt = 0;
    let delay = cfg.retryDelayMs;

    for (;;) {
      try {
        const value = await task();
        return { ok: true, value };
      } catch (err: any) {
        attempt += 1;

        const status: number | undefined =
          typeof err?.status === "number"
            ? err.status
            : typeof err?.response?.status === "number"
              ? err.response.status
              : undefined;

        const retryable =
          status === 429 || (status !== undefined && status >= 500);

        if (!retryable || attempt > maxRetries) {
          return { ok: false, error: err };
        }

        await new Promise((r) => setTimeout(r, delay));
        delay = Math.min(delay * 2, cfg.retryDelayMs * 2 ** maxRetries);
      }
    }
  }
}

export const OkxRequestQueue = new OkxRequestQueueClass();
