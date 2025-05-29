"use client";

import { ReactElement } from "react";

import { Loader2 } from "lucide-react";
import CountUp from "react-countup";

import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: string | ReactElement;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ElementType;
  gradientFrom: string;
  gradientTo: string;
  loading?: boolean;
}

export default function StatsCard({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  gradientFrom,
  gradientTo,
  loading = false,
}: Props) {
  /* ---------------------------------------------------------------------- */
  /*                        Numeric value helper logic                       */
  /* ---------------------------------------------------------------------- */
  const isNumeric =
    !loading &&
    typeof value === "string" &&
    /^[$]?\d+(\.\d+)?(K|M)?$/.test(value.replace(/,/g, ""));
  const numericString =
    isNumeric && typeof value === "string"
      ? value.replace(/[^0-9.]/g, "")
      : "0";

  /* ---------------------------------------------------------------------- */
  /*                       Foreground colour determination                   */
  /* ---------------------------------------------------------------------- */
  const changeColor = (() => {
    if (trend === "up") return "text-emerald-300";
    if (trend === "down") return "text-rose-300";
    return "text-white/80";
  })();

  /* ---------------------------------------------------------------------- */
  /*                                  Render                                 */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="relative group rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-shadow hover:shadow-xl text-white">
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        }}
      />
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />

      {/* Faded watermark icon */}
      <Icon className="absolute -right-6 -top-6 h-32 w-32 text-white/10 group-hover:text-white/15 transition-colors" />

      {/* Content */}
      <div className="relative z-10 p-6">
        <p className="text-sm font-semibold">{title}</p>

        {loading ? (
          <div className="flex items-center gap-2 mt-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-lg">Loading…</span>
          </div>
        ) : (
          <p className="text-3xl font-extrabold mt-2">
            {isNumeric ? (
              <>
                {value.toString().startsWith("$") && "$"}
                <CountUp
                  start={0}
                  end={parseFloat(numericString)}
                  duration={1}
                  separator=","
                  decimals={value.toString().includes(".") ? 2 : 0}
                />
                {/K|M$/.test(value.toString()) && value.toString().slice(-1)}
              </>
            ) : (
              value
            )}
          </p>
        )}

        {change && (
          <span className={cn("text-xs font-medium", changeColor)}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
