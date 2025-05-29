import "@solana/wallet-adapter-react-ui/styles.css";
import { Geist, Geist_Mono } from "next/font/google";

import type { Metadata } from "next";

import { ThemeProvider } from "@/components/theme/theme-provider";
import {
  WalletAdapterProviders,
  WalletProvider,
} from "@/lib/contexts/wallet-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Voxen Forge • Intelligent DeFi Trading Platform",
  description:
    "AI-driven tools on Solana for seamless DeFi trading and portfolio management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <WalletAdapterProviders>
            <WalletProvider>{children}</WalletProvider>
          </WalletAdapterProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
