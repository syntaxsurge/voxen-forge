"use client";

import { ChangeEvent } from "react";

import { Button } from "@/components/ui/button";

interface Props {
  value: string;
  onChange: (v: string) => void;
  options?: string[];
  disabled?: boolean;
}

export default function SlippageSelector({
  value,
  onChange,
  options = ["0.1", "0.5", "1.0", "3.0"],
  disabled,
}: Props) {
  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v === "") {
      onChange("");
      return;
    }
    const num = parseFloat(v);
    if (Number.isNaN(num)) return;
    if (num < 0.1) onChange("0.1");
    else if (num > 100) onChange("100");
    else onChange(num.toString());
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {options.map((opt) => (
          <Button
            key={opt}
            variant="outline"
            size="sm"
            className={`h-7 px-3 text-xs ${
              value === opt
                ? "bg-purple-500/30 border-purple-500/60 ring-2 ring-purple-400"
                : "border-white/20 hover:bg-white/10"
            }`}
            disabled={disabled}
            onClick={() => onChange(opt)}
          >
            {opt}%
          </Button>
        ))}
      </div>
      <div className="relative w-24">
        <input
          type="number"
          step="0.1"
          min="0.1"
          max="100"
          value={value}
          onChange={handleInput}
          disabled={disabled}
          placeholder="Custom"
          className="h-7 w-full rounded-md bg-transparent border border-white/20 text-xs px-2 text-white placeholder:text-white/40 outline-none"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/70">
          %
        </span>
      </div>
    </div>
  );
}
