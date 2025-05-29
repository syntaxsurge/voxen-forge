"use client";

import { cn } from "@/lib/utils";

interface Props {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export default function SectionHeading({
  title,
  subtitle,
  align = "center",
}: Props) {
  return (
    <div
      className={cn("mb-12", align === "center" ? "text-center mx-auto" : "")}
    >
      <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-300 via-sky-300 to-fuchsia-300 bg-clip-text text-transparent">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-2xl text-muted-foreground mx-auto">{subtitle}</p>
      )}
    </div>
  );
}
