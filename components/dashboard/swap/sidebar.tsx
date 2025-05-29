"use client";

import InstructionsCard from "./instructions-card";
import TipsCard from "./tips-card";

export default function Sidebar() {
  return (
    <div className="space-y-4">
      <InstructionsCard />
      <TipsCard />
    </div>
  );
}
