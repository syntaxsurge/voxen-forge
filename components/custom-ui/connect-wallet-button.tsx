"use client";

import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";

/* WalletMultiButton needs dynamic import to disable SSR */
const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false },
);

export interface ConnectWalletButtonProps {
  className?: string;
}

export function ConnectWalletButton({ className }: ConnectWalletButtonProps) {
  return (
    <WalletMultiButton
      className={cn(
        "!rounded-full !px-5 !py-2 !font-medium !text-sm !bg-purple-600 hover:!bg-purple-700",
        className,
      )}
    />
  );
}

export default ConnectWalletButton;
