"use client";

import Image from "next/image";

import { FEATURES } from "./feature-items";
import SectionHeading from "./section-heading";

const SCREENSHOTS = [
  {
    src: "/images/ai-chat.png",
    alt: "AI Chat screenshot answering a token balance query",
    caption: "AI Chat — conversational insights",
  },
  {
    src: "/images/swap.png",
    alt: "Token Swap screenshot showing SOL to USDC trade preview",
    caption: "Swap — one-click SOL↔︎USDC trades",
  },
  {
    src: "/images/cross-chain-swap.png",
    alt: "Cross-Chain Swap screenshot routing Solana to Ethereum",
    caption: "Cross-Chain — Solana⇄EVM bridging",
  },
];

export default function FeaturesSection() {
  return (
    <section id="modules" className="relative py-32 bg-background">
      {/* Subtle grid background ------------------------------------------- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-grid-white/[0.04] [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]"
      />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 px-6 md:grid-cols-2 md:items-start">
        {/* Edge Modules list ------------------------------------------------ */}
        <div>
          <SectionHeading
            title="Edge Modules"
            subtitle="Plug-and-play components that super-charge your workflow."
            align="left"
          />

          <ol className="relative ml-4 border-l border-white/10">
            {FEATURES.map(({ title, desc, icon: Icon }) => (
              <li key={title} className="mb-12 ml-6">
                <span className="absolute -left-4 flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Screenshots gallery --------------------------------------------- */}
        <div className="flex justify-center md:justify-end">
          <div className="grid gap-8 w-full max-w-md">
            {SCREENSHOTS.map(({ src, alt, caption }) => (
              <div key={src} className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/10 blur-lg -z-10" />
                <Image
                  src={src}
                  alt={alt}
                  width={640}
                  height={360}
                  className="rounded-2xl border border-white/10 shadow-xl object-cover"
                  priority
                />
                <p className="mt-2 text-center text-xs text-white/60">
                  {caption}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
