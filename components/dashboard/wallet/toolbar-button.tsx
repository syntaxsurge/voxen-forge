"use client";

import { Button } from "@/components/ui/button";

interface ToolbarButtonProps {
  icon: React.ElementType;
  label: string;
  outline?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export default function ToolbarButton({
  icon: Icon,
  label,
  outline,
  onClick,
  disabled,
}: ToolbarButtonProps) {
  const base =
    "gap-2 text-white " +
    (outline
      ? "border-white/20 hover:bg-white/10"
      : "bg-white/10 hover:bg-white/15 border border-white/10");

  return (
    <Button
      variant={outline ? "outline" : "default"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={base}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
}
