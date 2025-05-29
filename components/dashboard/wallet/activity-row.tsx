"use client";

import { Download, Send } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  date: string;
  amount: string;
  status: string;
  type: "receive" | "send" | "swap";
}

export default function ActivityRow({ tx }: { tx: Activity }) {
  const Icon = tx.type === "receive" ? Download : Send;
  const bg =
    tx.type === "receive"
      ? "bg-white/10 border-white/10"
      : "bg-white/5 border-white/10";

  return (
    <div className="flex justify-between items-center p-3 hover:bg-white/5 transition-all rounded-lg border border-white/5 hover:border-white/10">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${bg}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="font-medium">{tx.title}</p>
          <p className="text-sm text-white/60">{tx.date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium">{tx.amount}</p>
        <p className="text-sm text-white/60">{tx.status}</p>
      </div>
    </div>
  );
}
