"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
  ArrowLeftRight,
  Home,
  Wallet,
  BarChart3,
} from "lucide-react";

import Logo from "@/components/landing/logo";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function DashboardSidebar({ open, setOpen }: DashboardSidebarProps) {
  const pathname = usePathname();

  const routes = [
    { label: "Home", icon: Home, href: "/dashboard" },
    { label: "AI Chat", icon: MessageSquare, href: "/dashboard/ai-chat" },
    { label: "Wallet", icon: Wallet, href: "/dashboard/wallet" },
    {
      label: "Sentiment Radar",
      icon: BarChart3,
      href: "/dashboard/sentiment-radar",
    },
    { label: "Swap", icon: ArrowLeftRight, href: "/dashboard/swap" },
    {
      label: "Cross-Chain Swap",
      icon: ArrowLeftRight,
      href: "/dashboard/cross-chain",
    },
  ];

  return (
    <div
      className={cn(
        "fixed h-full z-20 backdrop-blur-sm shadow-lg border-r transition-all duration-300",
        "bg-background/80 dark:bg-background/50 border-border dark:border-white/10",
        open ? "w-64" : "w-16",
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-5 border-b border-border dark:border-white/10">
          <Link href="/" className={cn("flex items-center", !open && "hidden")}>
            <Logo />
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg hover:bg-muted/20 dark:hover:bg-white/5 transition-colors"
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          >
            {open ? (
              <PanelLeftClose className="h-5 w-5 text-foreground/70 dark:text-white/70" />
            ) : (
              <PanelLeftOpen className="h-5 w-5 text-foreground/70 dark:text-white/70" />
            )}
          </button>
        </div>

        <div className="flex-1 py-6 overflow-y-auto scrollbar-hide">
          <nav className="px-3 space-y-1">
            {routes.map(({ label, icon: Icon, href }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center px-3 py-3.5 text-sm rounded-lg transition-colors relative group",
                    active
                      ? "bg-muted/30 text-foreground dark:bg-white/10 dark:text-white"
                      : "text-foreground/60 hover:text-foreground hover:bg-muted/20 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5",
                    !open && "justify-center",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      active
                        ? "text-foreground dark:text-white"
                        : "text-foreground/60 dark:text-white/60",
                    )}
                  />
                  {open && <span className="ml-3">{label}</span>}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-foreground dark:bg-white rounded-r-full" />
                  )}
                  {!open && (
                    <div className="absolute left-full ml-2 rounded-md px-2 py-1 bg-black/80 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

export default DashboardSidebar;
