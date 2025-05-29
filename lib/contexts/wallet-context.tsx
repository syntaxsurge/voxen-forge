"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import {
  SendTransactionOptions,
  WalletAdapterNetwork,
} from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider as AdapterWalletProvider,
  useConnection,
  useWallet as useAdapterWallet,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  LedgerWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import {
  clusterApiUrl,
  Connection,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";

import { solana } from "@/lib/config";

interface WalletContextType {
  wallet: any | null;
  connecting: boolean;
  connected: boolean;
  publicKey: string | null;
  connection: Connection | null;
  sendTransaction: (
    tx: Transaction | VersionedTransaction,
    connection: Connection,
    opts?: SendTransactionOptions,
  ) => Promise<string>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

const noopSend = async () => {
  throw new Error("Wallet not initialised");
};

const WalletContext = createContext<WalletContextType>({
  wallet: null,
  connecting: false,
  connected: false,
  publicKey: null,
  connection: null,
  sendTransaction: noopSend,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
});

export const useWallet = () => useContext(WalletContext);

export const WalletAdapterProviders: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const endpoint = useMemo(() => {
    if (solana.rpcUrl && solana.rpcUrl.trim().length > 0) {
      return solana.rpcUrl.trim();
    }
    return clusterApiUrl(WalletAdapterNetwork.Mainnet);
  }, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network: WalletAdapterNetwork.Mainnet }),
      new LedgerWalletAdapter(),
    ],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <AdapterWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </AdapterWalletProvider>
    </ConnectionProvider>
  );
};

export const WalletProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const {
    wallet,
    connecting,
    connected,
    publicKey,
    connect,
    disconnect,
    sendTransaction,
  } = useAdapterWallet();
  const { connection } = useConnection();

  const ctx = useMemo(
    () => ({
      wallet,
      connecting,
      connected,
      publicKey: publicKey ? publicKey.toBase58() : null,
      connection,
      sendTransaction,
      connectWallet: connect,
      disconnectWallet: disconnect,
    }),
    [
      wallet,
      connecting,
      connected,
      publicKey,
      connection,
      sendTransaction,
      connect,
      disconnect,
    ],
  );

  return (
    <WalletContext.Provider value={ctx}>{children}</WalletContext.Provider>
  );
};
