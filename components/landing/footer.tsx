"use client";

import Link from "next/link";

import { Github, Twitter, Mail } from "lucide-react";

import Logo from "./logo";

const SOCIAL = [
  {
    href: "https://github.com/syntaxsurge/voxen-forge",
    icon: Github,
    label: "GitHub",
  },
  { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
  { href: "mailto:syntaxsurge@gmail.com", icon: Mail, label: "Email" },
];

const NAV = [
  { href: "#modules", label: "Modules" },
  { href: "#velocity", label: "Velocity" },
  { href: "/dashboard", label: "Launch App" },
];

export default function FooterSection() {
  return (
    <footer className="bg-background border-t border-white/10">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-3">
        {/* Brand */}
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Build, trade, and analyze with institutional-grade speed — all from
            one unified console.
          </p>
        </div>

        {/* Navigation */}
        <nav>
          <h3 className="mb-4 font-semibold text-foreground">Site</h3>
          <ul className="space-y-2">
            {NAV.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Social */}
        <div>
          <h3 className="mb-4 font-semibold text-foreground">Connect</h3>
          <div className="flex gap-4">
            {SOCIAL.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted/20 hover:text-foreground"
              >
                <Icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
      <p className="pb-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Voxen Forge
      </p>
    </footer>
  );
}
