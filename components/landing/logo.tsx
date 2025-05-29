"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/images/voxen-forge-logo.png"
        alt="Voxen Forge logo"
        width={32}
        height={32}
        className="h-8 w-8 rounded-md"
        priority
      />
      <span className="font-bold text-xl text-foreground">VOXEN FORGE</span>
    </div>
  );
}
