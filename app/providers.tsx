"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RitualProvider } from "@/components/RitualContext";
import { WalletModalProvider } from "@/components/WalletModal";
import { wagmiConfig, walletConnectConfigured } from "@/lib/wallet";

const queryClient = new QueryClient();

if (!walletConnectConfigured && typeof window !== "undefined") {
  console.warn(
    "NULL RITE: add NEXT_PUBLIC_REOWN_PROJECT_ID in Vercel before public mobile WalletConnect launch."
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount>
      <QueryClientProvider client={queryClient}>
        <WalletModalProvider>
          <RitualProvider>{children}</RitualProvider>
        </WalletModalProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
