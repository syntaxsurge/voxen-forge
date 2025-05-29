"use client";

import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import SectionHeading from "./section-heading";

export default function CallToAction() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Decorative blobs -------------------------------------------------- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-64 -left-64 h-[640px] w-[640px] rounded-full bg-fuchsia-600/20 blur-3xl" />
        <div className="absolute -bottom-64 -right-64 h-[640px] w-[640px] rounded-full bg-purple-600/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-6 text-center">
        <SectionHeading
          title="Ready to elevate your edge?"
          subtitle="Join thousands of strategists harnessing Voxen Forge to outrun the market."
        />
        <Button asChild size="lg" className="gap-2 mx-auto">
          <Link href="/dashboard">
            Launch App
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
