import { NextRequest, NextResponse } from "next/server";

import { chatWithContext } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { query, context } = await request.json();
    if (typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "Missing or invalid 'query' string." },
        { status: 400 },
      );
    }
    if (typeof context !== "string" || !context.trim()) {
      return NextResponse.json(
        { error: "Missing or invalid 'context' string." },
        { status: 400 },
      );
    }
    const result = await chatWithContext(query, context);
    return NextResponse.json({ result });
  } catch (err: any) {
    return NextResponse.json(
      { error: String(err?.message ?? err) },
      { status: 500 },
    );
  }
}
