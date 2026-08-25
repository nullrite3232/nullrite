"use client";

import "@rainbow-me/rainbowkit/styles.css";
import {
  RainbowKitProvider,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  coinbaseWallet,
  rainbowWallet,
  walletConnectWallet,
  okxWallet,
  phantomWallet,
  rabbyWallet,
  braveWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RH_CHAIN, RH_TESTNET_CHAIN } from "@/lib/chain";

const config = getDefaultConfig({
  appName: "NULL RITE",
  projectId: process.env.NEXT_PUBLIC_WC_ID ?? "",
  chains: [RH_TESTNET_CHAIN, RH_CHAIN],
  wallets: [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, coinbaseWallet, rainbowWallet],
    },
    {
      groupName: "Popular",
      wallets: [
        okxWallet,
        phantomWallet,
        rabbyWallet,
        braveWallet,
        walletConnectWallet,
      ],
    },
  ],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}