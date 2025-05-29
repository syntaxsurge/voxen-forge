"use client";

import Link from "next/link";
import React from "react";

import { Menu, X } from "lucide-react";

import { ModeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import Logo from "./logo";

const NAV = [
  { name: "Modules", href: "#modules" },
  { name: "Velocity", href: "#velocity" },
];

export default function LandingHeader() {
  const [open, setOpen] = React.useState(false);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-30 transition-colors",
        "supports-[backdrop-filter]:bg-background/60 supports-[backdrop-filter]:backdrop-blur-md",
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Logo />

        {/* desktop nav */}
        <ul className="hidden gap-6 text-sm md:flex">
          {NAV.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button asChild size="sm">
            <Link href="/dashboard">Launch</Link>
          </Button>
          {/* mobile toggle */}
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen(!open)}
            className="md:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* mobile drawer */}
      {open && (
        <div className="md:hidden">
          <ul className="space-y-4 border-t bg-background px-6 py-4 pb-6">
            {NAV.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
