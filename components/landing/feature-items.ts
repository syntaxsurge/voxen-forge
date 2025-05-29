import {
  Activity,
  Brain,
  Gauge,
  LayoutDashboard,
  LineChart,
  Shuffle,
  AlertCircle,
  Vault,
  Image as ImageIcon,
} from "lucide-react";

export const FEATURES = [
  {
    title: "Predictive Analytics",
    desc: "Time-series models flag momentum shifts before they print on-chain.",
    icon: LineChart,
  },
  {
    title: "Cross-DEX Routing",
    desc: "Automated route finder locks best execution across every Solana venue.",
    icon: Shuffle,
  },
  {
    title: "Instant Portfolio Sync",
    desc: "Unified view of every wallet and token, refreshed in real-time.",
    icon: LayoutDashboard,
  },
  {
    title: "Smart Gas Saver",
    desc: "Adaptive fee engine learns network conditions to minimise costs.",
    icon: Gauge,
  },
  {
    title: "Sentiment Radar",
    desc: "NLP pipelines digest social feeds to map crowd emotion to price.",
    icon: Activity,
  },
  {
    title: "AI Copilot",
    desc: "Conversational interface powered by GPT-4o turns queries into trades.",
    icon: Brain,
  },
  {
    title: "Real-Time Risk Alerts",
    desc: "Customisable notifications warn you when market volatility spikes.",
    icon: AlertCircle,
  },
  {
    title: "Yield Optimizer",
    desc: "Auto-compounds rewards across top protocols for maximum APY.",
    icon: Vault,
  },
  {
    title: "NFT Portfolio",
    desc: "Track, value and trade multi-chain NFTs alongside your tokens.",
    icon: ImageIcon,
  },
] as const;
