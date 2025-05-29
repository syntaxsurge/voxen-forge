import OpenAI from "openai";

const isServer = typeof window === "undefined";
let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!isServer) {
    throw new Error("OpenAI SDK must not be instantiated in the browser");
  }
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing required environment variable: OPENAI_API_KEY");
    }
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

const API_TYPES = [
  "supported_chains",
  "price",
  "trades",
  "candlestick",
  "candlestick_history",
  "hist_data",
  "token_index_price",
  "historical_index_price",
  "total_value",
  "total_token_balances",
  "token_balance",
  "specific_token_balance",
  "transaction_history",
  "tx_by_hash",
] as const;

const AGENT_SYSTEM_PROMPT = `You are Voxen Forge's reasoning module. Your sole task is to translate a natural-language user request into exactly one JSON specification for the backend.

### Response schema — MUST always be returned
{
  "type": "<one of ${API_TYPES.join(", ")}>",
  "token_name": "<optional token symbol such as SOL or ETH>",
  "transaction_hash": "<required only when type is tx_by_hash>"
}

### Choosing **type**
- Wallet transaction queries → transaction_history
- Wallet balance queries → token_balance
- Price, trade or chart queries → the matching market-data type
- Anything else that no API type covers → return:
{ "type": "general_answer", "message": "<concise helpful answer>" }

### Mandatory rules
1. Always include the "type" field; never omit or leave it empty.
2. Default token_name to "SOL" when the query is about the user's wallet and no token is specified.
3. Do not invent balances, prices or transactions — the backend provides them.
4. Respond with ONLY the raw JSON (no Markdown, no commentary, no code fences).`;

const CONTEXT_SYSTEM_PROMPT = `You are Voxen Forge AI, the conversational copilot inside **Voxen Forge** — an all-in-one Solana-first DeFi trading suite that leverages the **OKX DEX API** for ultrafast, on-chain-accurate data. Voxen Forge provides these modules:

• **Dashboard / Home** - portfolio, market metrics and personalised stats
• **AI Chat** - natural-language analytics, automation and smart trade actions
• **Wallet** - address QR display, send/receive, recent activity and quick swaps
• **Solana Swap** - single-chain swaps on Solana with live quoting and execution
• **Cross-Chain Swap** - bridge and swap in one click between 20+ chains (e.g. Solana ↔ Ethereum)
• **Supported Pairs & Bridges Explorer** - searchable list of every bridgeable token pair and bridge
• **Portfolio Dashboard** - real-time balances, P&L, token holdings and history
• **Market Sentiment Radar** - live sentiment heat-map and trend signals
• **Gas Saver** - optimised routing to minimise fees on supported chains
• **Stats & Charts** - candlesticks, price feeds and trade blotters powered by OKX

Whenever it helps the user, highlight how these modules let them achieve their goal inside Voxen Forge. Answer concisely; if context is insufficient, say you are unsure.`;

async function chatCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
) {
  const completion = await getClient().chat.completions.create({
    model: "gpt-4o",
    messages,
    temperature: 0.2,
  });
  return completion.choices[0]?.message?.content ?? "";
}

/* -------------------------------------------------------------------------- */
/*                             Server-side helpers                            */
/* -------------------------------------------------------------------------- */

async function openaiAgentInternal(userQuery: string): Promise<any> {
  const messages = [
    { role: "system", content: AGENT_SYSTEM_PROMPT },
    { role: "user", content: userQuery },
  ];
  const rawText = await chatCompletion(messages as any[]);
  try {
    const jsonMatch = rawText.match(/{[\s\S]*}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return { type: "general_answer", message: rawText.trim() };
  } catch {
    return { type: "general_answer", message: rawText.trim() };
  }
}

async function chatWithContextInternal(
  query: string,
  context: string,
): Promise<string> {
  const messages = [
    { role: "system", content: CONTEXT_SYSTEM_PROMPT },
    { role: "system", content: `Context:\n${context}` },
    { role: "user", content: query },
  ];
  return (await chatCompletion(messages as any[])).trim();
}

/* -------------------------------------------------------------------------- */
/*                                Public API                                  */
/* -------------------------------------------------------------------------- */

export async function openaiAgent(userQuery: string): Promise<any> {
  if (isServer) return openaiAgentInternal(userQuery);
  const res = await fetch("/api/openai/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: userQuery }),
  });
  if (!res.ok) throw new Error(`OpenAI agent error: ${res.status}`);
  return res.json();
}

export async function chatWithContext(
  query: string,
  context: string,
): Promise<string> {
  if (isServer) return chatWithContextInternal(query, context);
  const res = await fetch("/api/openai/context", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, context }),
  });
  if (!res.ok) throw new Error(`OpenAI context error: ${res.status}`);
  return (await res.json()).result as string;
}
