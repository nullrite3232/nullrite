"use client";

import "@rainbow-me/rainbowkit/styles.css";
import {
  RainbowKitProvider,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  coinbaseWallet,
  okxWallet,
  rabbyWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RH_CHAIN, RH_TESTNET_CHAIN } from "@/lib/chain";
import { RitualProvider } from "@/components/RitualContext";

const config = getDefaultConfig({
  appName: "NULL RITE",
  projectId: process.env.NEXT_PUBLIC_WC_ID ?? "",
  chains: [RH_TESTNET_CHAIN, RH_CHAIN],
  wallets: [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, rabbyWallet, okxWallet],
    },
    {
      groupName: "Other",
      wallets: [coinbaseWallet, walletConnectWallet],
    },
  ],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <RitualProvider>{children}</RitualProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
