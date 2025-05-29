"use client";

import { useMemo } from "react";

import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import {
  CandlestickController,
  CandlestickElement,
} from "chartjs-chart-financial";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { Chart } from "react-chartjs-2";

import "chartjs-adapter-date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

ChartJS.register(
  TimeScale,
  LinearScale,
  Tooltip,
  Legend,
  CandlestickController,
  CandlestickElement,
);

function formatTimestamp(ts: string | number) {
  const d = new Date(Number(ts));
  return (
    d.toLocaleDateString() +
    " " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

function formatPrice(v: string | number, digits = 6) {
  const n = Number(v);
  return n === 0 || Number.isNaN(n) ? "0.00" : n.toFixed(digits);
}

interface Props {
  data: any;
  title: string;
  inline?: boolean;
}

export default function SolanaCandlestickChart({
  data,
  title,
  inline = false,
}: Props) {
  if (!data?.data?.length) return null;

  const candles = useMemo(() => {
    const raw = data.data.reverse().slice(-60); // last 60 points (~12 h)
    return raw.map((c: any) => ({
      x: Number(c[0]),
      o: +c[1],
      h: +c[2],
      l: +c[3],
      c: +c[4],
    }));
  }, [data]);

  if (!candles.length) return null;

  const current = candles.at(-1)!.c;
  const prev = candles.at(-2)?.c ?? current;
  const delta = current - prev;
  const pos = delta >= 0;

  const chartData = {
    datasets: [
      {
        label: "SOL / USD",
        data: candles,
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderColor: "#999",
        color: {
          up: "#22c55e",
          down: "#ef4444",
          unchanged: "#999999",
        },
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const { o, h, l, c } = ctx.raw;
            return [
              `Time: ${formatTimestamp(ctx.raw.x)}`,
              `Open: $${formatPrice(o, 4)}`,
              `High: $${formatPrice(h, 4)}`,
              `Low:  $${formatPrice(l, 4)}`,
              `Close: $${formatPrice(c, 4)}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: { unit: "hour", tooltipFormat: "PPpp" },
        grid: { display: false },
      },
      y: {
        position: "right",
        grid: { display: true },
        ticks: {
          callback: (v: number | string) => `$${formatPrice(v as number, 2)}`,
        },
      },
    },
  };

  const Inner = () => (
    <>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl font-bold text-foreground dark:text-white">
          ${formatPrice(current)}
        </span>
        <span
          className={cn(
            "flex items-center gap-1 text-sm",
            pos
              ? "text-emerald-600 dark:text-green-400"
              : "text-rose-600 dark:text-red-400",
          )}
        >
          {pos ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {pos ? "+" : ""}
          {formatPrice(delta)}
        </span>
      </div>
      <div className="h-[240px]">
        <Chart type="candlestick" data={chartData} options={options} />
      </div>
    </>
  );

  if (inline) {
    return <Inner />;
  }

  return (
    <Card
      className={cn(
        "w-full backdrop-blur-sm border",
        "bg-muted/40 border-border",
        "dark:bg-black/40 dark:border-white/20",
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-foreground dark:text-white">
          <BarChart3 className="h-5 w-5" /> {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground dark:text-white">
            ${formatPrice(current)}
          </span>
          <span
            className={cn(
              "flex items-center gap-1 text-sm",
              pos
                ? "text-emerald-600 dark:text-green-400"
                : "text-rose-600 dark:text-red-400",
            )}
          >
            {pos ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {pos ? "+" : ""}
            {formatPrice(delta)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <Chart type="candlestick" data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
