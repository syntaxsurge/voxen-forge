"use client";

import { BarChart3 } from "lucide-react";

import SolanaCandlestickChart from "@/components/dashboard/candlestick-chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { markdownToHtml } from "@/lib/utils";

interface Props {
  title: string;
  chartData: any;
  summary?: string;
}

export default function ChartCard({ title, chartData, summary }: Props) {
  if (!chartData?.data?.length) return null;

  return (
    <Card className="w-full backdrop-blur-sm border bg-muted/40 border-border dark:bg-black/40 dark:border-white/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-foreground dark:text-white">
          <BarChart3 className="h-5 w-5" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SolanaCandlestickChart data={chartData} title={title} inline />
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
