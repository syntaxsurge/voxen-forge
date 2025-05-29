"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { ConnectWalletButton } from "@/components/custom-ui/connect-wallet-button";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import FooterSection from "@/components/landing/footer";
import { ModeToggle } from "@/components/theme/theme-toggle";
import { useWallet } from "@/lib/contexts/wallet-context";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { connected } = useWallet();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getPageName = () => {
    if (pathname === "/dashboard") return "Dashboard / Home";
    const segments = pathname.split("/");
    const pageName = segments[segments.length - 1];
    return `Dashboard / ${pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/-/g, " ")}`;
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col">
      {/* Decorative radial accents */}
      <div
        aria-hidden
        className="fixed inset-0 z-[-20] pointer-events-none isolate opacity-5"
      >
        <div className="absolute left-0 top-0 h-[80rem] w-[35rem] -translate-y-[350px] -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,100%,.08)_0,hsla(0,0%,100%,.02)_50%,hsla(0,0%,100%,0)_80%)]" />
        <div className="absolute right-0 top-0 h-[80rem] w-56 -translate-y-1/2 translate-x-[5%] rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,100%,.06)_0,hsla(0,0%,100%,.02)_80%,transparent_100%)]" />
      </div>

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Main layout */}
      <div className="flex flex-1">
        <DashboardSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        <div
          className={cn(
            "flex flex-col flex-1 min-h-screen transition-all duration-300",
            sidebarOpen ? "ml-64" : "ml-16",
          )}
        >
          <div className="sticky top-0 z-10 border-b border-white/10 bg-black/30 py-3 px-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-white/90">
                {getPageName()}
              </h2>
              <div className="flex items-center gap-2">
                <ModeToggle />
                <ConnectWalletButton />
              </div>
            </div>
          </div>

          <main className="flex flex-col flex-1 px-12 py-10">
            {connected ? (
              children
            ) : (
              <div className="flex items-center justify-center flex-1">
                <div className="text-center space-y-6">
                  <p className="text-lg text-white/70">
                    Please connect your wallet to access the dashboard.
                  </p>
                  <ConnectWalletButton />
                </div>
              </div>
            )}
          </main>

          {/* Footer (offset with sidebar margin) */}
          <FooterSection />
        </div>
      </div>
    </div>
  );
}
