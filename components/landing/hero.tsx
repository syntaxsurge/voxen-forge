"use client";

import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HeroSection() {
  return (
    <section className="relative isolate min-h-[90vh] overflow-hidden bg-gradient-to-br from-[#0B0023] via-[#12002E] to-[#1A003D]">
      {/* Decorative gradient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-60 -left-60 h-[720px] w-[720px] rounded-full bg-fuchsia-600/25 blur-[260px] animate-pulse" />
        <div className="absolute -bottom-60 -right-60 h-[720px] w-[720px] rounded-full bg-purple-600/25 blur-[260px] animate-pulse delay-2000" />
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-32 md:grid-cols-2">
        {/* Copy ---------------------------------------------------------------- */}
        <div className="text-center md:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className={cn(
              "text-balance text-5xl md:text-6xl font-extrabold leading-tight",
              "bg-gradient-to-r from-purple-300 via-sky-300 to-fuchsia-300 bg-clip-text text-transparent",
            )}
          >
            Forge&nbsp;Alpha on&nbsp;
            <span className="whitespace-nowrap">Solana&nbsp;DeFi</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-6 text-lg text-muted-foreground max-w-md mx-auto md:mx-0"
          >
            Real-time insight. Lightning execution. AI that thinks in basis
            points.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-start"
          >
            <Button asChild size="lg" className="gap-2">
              <Link href="/dashboard">
                Launch App
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="#modules">See Capabilities</Link>
            </Button>
          </motion.div>
        </div>

        {/* Hero illustration -------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: 4 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative mx-auto w-full max-w-lg"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/10 blur-lg -z-10" />
          <Image
            src="/images/dashboard-overview.png"
            alt="Dashboard overview screenshot displaying portfolio metrics and SOL performance"
            width={800}
            height={450}
            className="rounded-3xl border border-white/10 shadow-2xl object-cover"
            priority
          />
          <p className="mt-2 text-center text-xs text-white/60">
            Dashboard Overview — real-time portfolio snapshot
          </p>
        </motion.div>
      </div>
    </section>
  );
}
