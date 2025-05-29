"use client";

import { Bot } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { markdownToHtml } from "@/lib/utils";

interface Props {
  summary: string;
}

export default function SummaryCard({ summary }: Props) {
  if (!summary) return null;
  return (
    <Card className="w-full backdrop-blur-sm border bg-muted/40 border-border dark:bg-black/40 dark:border-white/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-foreground dark:text-white">
          <Bot className="h-5 w-5" /> AI Sentiment Insight
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="prose prose-invert text-white"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(summary) }}
        />
      </CardContent>
    </Card>
  );
}
