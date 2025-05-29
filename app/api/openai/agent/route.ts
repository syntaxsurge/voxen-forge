import { NextRequest, NextResponse } from "next/server";

import { openaiAgent } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    if (typeof query !== "string" || query.trim() === "") {
      return NextResponse.json(
        { error: "Missing or invalid 'query' string." },
        { status: 400 },
      );
    }
    const data = await openaiAgent(query);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: String(err?.message ?? err) },
      { status: 500 },
    );
  }
}
