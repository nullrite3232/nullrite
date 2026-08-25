"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RH_CHAIN } from "@/lib/chain";

const config = getDefaultConfig({
  appName: "NULL RITE",
  // WalletConnect Cloud project id (get free at cloud.walletconnect.com).
  // Falls back to "" so the app still builds before you set it.
  projectId: process.env.NEXT_PUBLIC_WC_ID ?? "",
  chains: [RH_CHAIN as any],
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
