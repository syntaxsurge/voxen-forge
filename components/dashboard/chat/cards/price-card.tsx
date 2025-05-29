"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { markdownToHtml } from "@/lib/utils";

interface Props {
  title: string;
  price: string;
  summary?: string;
}

export default function PriceCard({ title, price, summary }: Props) {
  const priceNum = Number(price);
  const pos = priceNum >= 0;

  return (
    <Card className="w-full backdrop-blur-sm border bg-muted/40 border-border dark:bg-black/40 dark:border-white/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-foreground dark:text-white">
          {pos ? (
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          ) : (
            <TrendingDown className="h-5 w-5 text-rose-500" />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-extrabold text-white">
          ${priceNum.toLocaleString(undefined, { maximumFractionDigits: 4 })}
        </p>
        {summary && (
          <div
            className="mt-4 text-sm text-white/70 prose prose-invert"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(summary) }}
          />
        )}
      </CardContent>
    </Card>
  );
}
