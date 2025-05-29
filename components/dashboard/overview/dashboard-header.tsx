"use client";

import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  loading: boolean;
  refresh: () => void;
}

export default function DashboardHeader({ loading, refresh }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
      <div>
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          Your DeFi Command Center
        </h1>
        <p className="text-white/70 mt-1 max-w-md">
          Monitor holdings, track prices and spot opportunities in real-time —
          all in one sleek dashboard.
        </p>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="border-white/20 hover:bg-white/10 text-white"
        onClick={refresh}
        disabled={loading}
      >
        <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
      </Button>
    </div>
  );
}
