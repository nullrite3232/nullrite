"use client";

import type { Config } from "wagmi";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RitualProvider } from "@/components/RitualContext";
import { reownConfigured, wagmiAdapter } from "@/lib/appkit";

const queryClient = new QueryClient();

if (!reownConfigured && typeof window !== "undefined") {
  console.warn(
    "NULL RITE: add NEXT_PUBLIC_REOWN_PROJECT_ID in Vercel to enable production mobile WalletConnect handoff."
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>
        <RitualProvider>{children}</RitualProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
