import crypto from "crypto";

import { NextResponse } from "next/server";

type Meta = Record<string, unknown>;

export function buildMeta(extra: Meta = {}): Meta {
  return {
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID(),
    ...extra,
  };
}

export function ok<T = unknown>(data: T, extraMeta: Meta = {}) {
  return NextResponse.json({ success: true, data, meta: buildMeta(extraMeta) });
}

export function badRequest(details: string, extraMeta: Meta = {}) {
  return NextResponse.json(
    {
      success: false,
      error: "Bad Request",
      details,
      meta: buildMeta(extraMeta),
    },
    { status: 400 },
  );
}

export function externalError(details: string, extraMeta: Meta = {}) {
  return NextResponse.json(
    {
      success: false,
      error: "External API Error",
      details,
      meta: buildMeta(extraMeta),
    },
    { status: 502 },
  );
}

export function internalError(details: string | Error, extraMeta: Meta = {}) {
  return NextResponse.json(
    {
      success: false,
      error: "Internal Server Error",
      details: String(details),
      meta: buildMeta(extraMeta),
    },
    { status: 500 },
  );
}

/* -------------------------------------------------------------------------- */
/*                        Centralised route error helper                      */
/* -------------------------------------------------------------------------- */

/**
 * Map unknown errors to a JSON response using standard error envelopes.
 */
export function handleError(error: unknown, extraMeta: Meta = {}) {
  const message = String((error as any)?.message ?? error);

  if (
    message.startsWith("Missing") ||
    message.startsWith("Invalid") ||
    message.startsWith("Parameter")
  ) {
    return badRequest(message, extraMeta);
  }

  if (message.includes("OKX API Error")) {
    return externalError(message, extraMeta);
  }

  if (message.includes("fetch")) {
    return externalError("Failed to connect to upstream API", extraMeta);
  }

  return internalError(message, extraMeta);
}
