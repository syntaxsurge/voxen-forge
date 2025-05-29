"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Wallet as WalletIcon,
  Copy,
  ExternalLink,
  Send,
  History,
  ArrowLeftRight,
} from "lucide-react";
import QRCode from "react-qr-code";

import PageCard from "@/components/custom-ui/page-card";
import ActivityRow from "@/components/dashboard/wallet/activity-row";
import CardContainer from "@/components/dashboard/wallet/card-container";
import IconButton from "@/components/dashboard/wallet/icon-button";
import TokenRow from "@/components/dashboard/wallet/token-row";
import ToolbarButton from "@/components/dashboard/wallet/toolbar-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/lib/contexts/wallet-context";
import { useDashboardData } from "@/lib/hooks/use-dashboard-data";
import { shortAddress, formatCurrency } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                            Dialog components                               */
/* -------------------------------------------------------------------------- */

function HistoryDialog({
  open,
  onOpenChange,
  transactions,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  transactions: any[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Transaction History</DialogTitle>
        </DialogHeader>
        {transactions.length === 0 ? (
          <p className="text-white/60">No recent transactions.</p>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {transactions.map((tx: any, idx: number) => (
              <ActivityRow
                key={`${tx.txHash}-${idx}`}
                tx={{
                  id: tx.txHash,
                  title: tx.symbol || "SOL",
                  date: new Date(Number(tx.txTime) * 1000).toLocaleString(),
                  amount: Number(tx.amount).toFixed(6),
                  status: tx.status || "Success",
                  type: Number(tx.amount) > 0 ? "receive" : "send",
                }}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SendDialog({
  open,
  onOpenChange,
  tokenSymbol,
  onSend,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tokenSymbol: string;
  onSend: (to: string, amount: string) => void;
}) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const reset = () => {
    setTo("");
    setAmount("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-md space-y-4">
        <DialogHeader>
          <DialogTitle>Send {tokenSymbol}</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Recipient address"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
        />
        <DialogFooter>
          <Button
            disabled={!to || !amount}
            onClick={() => {
              onSend(to, amount);
              onOpenChange(false);
              reset();
            }}
          >
            Send
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Page                                     */
/* -------------------------------------------------------------------------- */

export default function WalletPage() {
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const { loading, tokenAssets, transactions } = useDashboardData();

  const solAsset = tokenAssets.find((t: any) => t.symbol === "SOL");
  const solBalance = solAsset ? Number(solAsset.balance || 0) : 0;
  const solPrice = solAsset ? Number(solAsset.tokenPrice || 0) : 0;

  /* ---------------------------- dialog state ----------------------------- */
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendToken, setSendToken] = useState<{
    symbol: string;
    address?: string;
  } | null>(null);

  const openSendDialog = (token: { symbol: string; address?: string }) => {
    setSendToken(token);
    setSendOpen(true);
  };

  const handleSend = (to: string, amt: string) => {
    console.log(`Send ${amt} ${sendToken?.symbol} to ${to}`);
  };

  /* ----------------------- header action buttons ------------------------ */
  const headerActions = connected && (
    <div className="flex gap-2">
      <ToolbarButton
        icon={History}
        label="History"
        outline
        onClick={() => setHistoryOpen(true)}
        disabled={loading}
      />
      <ToolbarButton
        icon={Send}
        label="Send"
        onClick={() => openSendDialog({ symbol: "SOL" })}
        disabled={loading}
      />
    </div>
  );

  /* ------------------------------- render ------------------------------- */
  return (
    <PageCard
      icon={WalletIcon}
      title="Wallet"
      description={
        connected ? "Manage your crypto assets" : "Connect your wallet"
      }
      actions={headerActions}
    >
      {connected && publicKey ? (
        <div className="space-y-8">
          {/* Wallet card */}
          <CardContainer title="Solana Wallet">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="mb-4 sm:mb-0">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm text-white/60">
                    {shortAddress(publicKey)}
                  </p>
                  <IconButton
                    icon={Copy}
                    onClick={() => navigator.clipboard.writeText(publicKey)}
                  />
                  <IconButton
                    icon={ExternalLink}
                    href={`https://explorer.solana.com/address/${publicKey}`}
                  />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-white p-3 rounded-lg">
                  <QRCode
                    value={publicKey}
                    size={120}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
              </div>
            </div>
          </CardContainer>

          {/* Balance & Tokens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardContainer title="Native Balance">
              {loading ? (
                <p className="text-white/60">Loading balance…</p>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-white/20 border border-white/10 flex items-center justify-center">
                      <WalletIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">
                        {solBalance.toFixed(4)} SOL
                      </p>
                      <p className="text-sm text-white/60">
                        ≈ {formatCurrency(solBalance * solPrice)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <ToolbarButton
                      icon={ArrowLeftRight}
                      label="Swap"
                      outline
                      onClick={() => router.push("/dashboard/swap")}
                    />
                    <ToolbarButton
                      icon={Send}
                      label="Send"
                      onClick={() => openSendDialog({ symbol: "SOL" })}
                    />
                  </div>
                </>
              )}
            </CardContainer>

            <CardContainer title={`Tokens (${tokenAssets.length})`}>
              {loading ? (
                <p className="text-white/60">Loading tokens…</p>
              ) : tokenAssets.length === 0 ? (
                <p className="text-white/60">No tokens found.</p>
              ) : (
                <div className="space-y-4">
                  {tokenAssets.map((t: any) => (
                    <TokenRow
                      key={t.tokenContractAddress || t.address}
                      name={t.symbol}
                      amount={Number(t.balance).toFixed(6)}
                      value={formatCurrency(
                        Number(t.balance) * Number(t.tokenPrice),
                      )}
                      address={t.tokenContractAddress || t.address}
                      onSend={() =>
                        openSendDialog({
                          symbol: t.symbol,
                          address: t.tokenContractAddress || t.address,
                        })
                      }
                    />
                  ))}
                </div>
              )}
            </CardContainer>
          </div>

          {/* Activity */}
          <CardContainer title="Recent Activity">
            {loading ? (
              <p className="text-white/60">Loading transactions…</p>
            ) : transactions.length === 0 ? (
              <p className="text-white/60">No recent transactions.</p>
            ) : (
              <div className="space-y-4">
                {transactions.slice(0, 10).map((tx: any, idx: number) => (
                  <ActivityRow
                    key={`${tx.txHash}-${idx}`}
                    tx={{
                      id: tx.txHash,
                      title: tx.symbol || "SOL",
                      date: new Date(
                        Number(tx.txTime) * 1000,
                      ).toLocaleDateString(),
                      amount: Number(tx.amount).toFixed(6),
                      status: tx.status || "Success",
                      type: Number(tx.amount) > 0 ? "receive" : "send",
                    }}
                  />
                ))}
              </div>
            )}
          </CardContainer>
        </div>
      ) : (
        <div className="backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl p-10 text-center hover:border-white/20 transition-all shadow-md">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full bg-white/10 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <WalletIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-white to-white/90 text-transparent bg-clip-text">
              Connect Your Wallet
            </h2>
            <p className="text-white/60 mb-6">
              Connect your Solana wallet to view your assets and interact with
              the platform.
            </p>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <HistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        transactions={transactions}
      />
      {sendToken && (
        <SendDialog
          open={sendOpen}
          onOpenChange={setSendOpen}
          tokenSymbol={sendToken.symbol}
          onSend={handleSend}
        />
      )}
    </PageCard>
  );
}
