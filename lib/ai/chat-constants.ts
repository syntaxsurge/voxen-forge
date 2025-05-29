import type { AiChatMessage } from "@/lib/ai/chat-ui";

export const ZOOM = {
  MIN: 50,
  MAX: 150,
  STEP: 25,
};

export const INITIAL_GREETING: AiChatMessage = {
  role: "system",
  content:
    "Hello, I’m Voxen Forge — your AI copilot for DeFi. Ask me anything about bridging, swapping, analysing markets or managing your portfolio and I’ll show you how Voxen Forge can help.",
};
