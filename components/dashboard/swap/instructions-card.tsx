"use client";

import { Info } from "lucide-react";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function InstructionsCard() {
  const steps = [
    "Select source and destination tokens.",
    "Enter the amount you want to swap.",
    "Adjust slippage tolerance if needed.",
    "Click Quote to preview your swap.",
    "Click Execute to perform the swap.",
  ];

  return (
    <Card className="bg-black/20 border-white/10 hover:border-white/20 transition-all">
      <CardHeader>
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Info className="h-5 w-5" /> How to use
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal list-inside space-y-2 text-sm text-white/80">
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
