"use client";

import { Gauge, ShieldCheck, Zap } from "lucide-react";

import SectionHeading from "./section-heading";

const ITEMS = [
  {
    title: "Zero-latency Order Flow",
    desc: "Colocated execution nodes fire routes faster than the mempool.",
    icon: Zap,
  },
  {
    title: "Adaptive Risk Controls",
    desc: "Dynamic guardrails tighten slippage and caps when volatility spikes.",
    icon: ShieldCheck,
  },
  {
    title: "GPU-accelerated Analytics",
    desc: "Vectorised computation surfaces actionable signals in microseconds.",
    icon: Gauge,
  },
] as const;

export default function AboutSection() {
  return (
    <section id="velocity" className="py-32 bg-background/50">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 md:grid-cols-2 md:items-center">
        {/* Illustration */}
        <div className="order-2 mx-auto w-full max-w-lg md:order-1">
          <img
            src="/images/sol-analytics.png"
            alt="Real-time SOL market analytics showing candlestick chart and stats"
            className="w-full rounded-xl border border-white/10"
          />
          <p className="mt-2 text-center text-xs text-white/60">
            Real-Time SOL Market Analytics
          </p>
        </div>

        {/* Copy */}
        <div className="order-1 md:order-2">
          <SectionHeading
            title="Engineered for Velocity & Precision"
            subtitle="Sub-millisecond feedback loops mean every click lands closer to optimal."
            align="left"
          />

          <ul className="space-y-6">
            {ITEMS.map(({ title, desc, icon: Icon }) => (
              <li key={title} className="flex gap-4">
                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-md bg-purple-600/20">
                  <Icon className="h-5 w-5 text-purple-300" />
                </div>
                <div>
                  <h4 className="font-medium">{title}</h4>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
