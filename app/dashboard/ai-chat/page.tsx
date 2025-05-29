"use client";

import { MessageSquare, RefreshCw, Send } from "lucide-react";

import PageCard from "@/components/custom-ui/page-card";
import ChatMessage from "@/components/dashboard/chat/chat-message";
import ChatSuggestions from "@/components/dashboard/chat/chat-suggestions";
import { Button } from "@/components/ui/button";
import { SUGGESTIONS } from "@/lib/ai/chat-ui";
import { useAiChat } from "@/lib/hooks/use-ai-chat";

export default function AiChatPage() {
  const { messages, input, setInput, loading, send, reset } = useAiChat();

  /* ---------------------------------------------------------------------- */
  /*                          Header action buttons                         */
  /* ---------------------------------------------------------------------- */
  const actions = (
    <Button
      variant="outline"
      size="sm"
      className="gap-1 border-white/20 hover:bg-white/10 text-white"
      onClick={reset}
      disabled={loading}
    >
      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      New Chat
    </Button>
  );

  /* ---------------------------------------------------------------------- */
  /*                               Render UI                                */
  /* ---------------------------------------------------------------------- */
  return (
    <PageCard
      icon={MessageSquare}
      title="AI Chat"
      description="Ask Voxen Forge AI anything"
      actions={actions}
      className="h-full"
    >
      {/* Messages container — textarea-style vertical resize */}
      <div
        className="mt-4 h-[60vh] w-full resize-y overflow-auto rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm"
        style={{ minHeight: "16rem" }}
      >
        <div className="flex flex-col space-y-4">
          {messages.map((m, i) => (
            <ChatMessage key={i} message={m} />
          ))}
        </div>
      </div>

      {/* Ask AI input */}
      <div className="mt-4">
        <div className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask Voxen Forge AI…"
            className="w-full py-4 px-4 bg-transparent border border-white/10 rounded-xl pr-24 focus:outline-none text-white placeholder:text-white/40"
            disabled={loading}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Button
              size="sm"
              className="h-8 px-3 bg-white/10 hover:bg-white/15 border border-white/10 text-white"
              onClick={send}
              disabled={!input.trim() || loading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Suggested prompts */}
      <ChatSuggestions
        suggestions={SUGGESTIONS}
        onSelect={setInput}
        disabled={loading}
      />
    </PageCard>
  );
}
