"use client";

import type { LucideIcon } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Item {
  label: string;
  value: React.ReactNode;
}

interface Props {
  icon: LucideIcon;
  title: string;
  items: Item[];
  gradientFrom: string;
  gradientTo: string;
  footer?: React.ReactNode;
}

export default function InfoCard({
  icon: Icon,
  title,
  items,
  gradientFrom,
  gradientTo,
  footer,
}: Props) {
  return (
    <Card
      className={cn(
        "mt-4 border backdrop-blur-sm",
        `bg-gradient-to-r from-[${gradientFrom}]/20 to-[${gradientTo}]/20`,
        `border-[${gradientFrom}]/30`,
      )}
    >
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Icon className="h-5 w-5" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-white">
        {items.map((it) => (
          <div key={it.label} className="flex justify-between">
            <span>{it.label}</span>
            <span>{it.value}</span>
          </div>
        ))}
        {footer}
      </CardContent>
    </Card>
  );
}
