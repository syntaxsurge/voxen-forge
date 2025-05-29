"use client";

import { Lightbulb } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function TipsCard() {
  const tips = [
    "Double-check token addresses to avoid scams.",
    "Keep a small SOL reserve for network fees.",
    "Higher slippage increases fill probability but may worsen price.",
    "For popular pairs, keep slippage below 1 %.",
    "Always review the quote before executing the swap.",
  ];

  return (
    <Card className="bg-black/20 border-white/10 hover:border-white/20 transition-all">
      <CardHeader>
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Lightbulb className="h-5 w-5" /> Pro Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc list-inside space-y-2 text-sm text-white/80">
          {tips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
