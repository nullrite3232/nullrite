"use client";

import { createAppKit } from "@reown/appkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RitualProvider } from "@/components/RitualContext";
import {
  appKitMetadata,
  appKitNetworks,
  projectId,
  reownConfigured,
  robinhoodNetwork,
  wagmiAdapter,
} from "@/lib/appkit";

const queryClient = new QueryClient();

createAppKit({
  adapters: [wagmiAdapter],
  networks: appKitNetworks,
  defaultNetwork: robinhoodNetwork,
  projectId,
  metadata: appKitMetadata,
  themeMode: "dark",
  themeVariables: {
    "--apkt-font-family": "Inter, sans-serif",
    "--apkt-accent": "#70ff95",
    "--apkt-color-mix": "#17101f",
    "--apkt-color-mix-strength": 18,
    "--apkt-border-radius-master": "2px",
    "--apkt-z-index": 9999,
  },
  features: {
    analytics: false,
    email: false,
    socials: [],
  },
  defaultAccountTypes: {
    eip155: "eoa",
  },
});

if (!reownConfigured && typeof window !== "undefined") {
  console.warn(
    "NULL RITE: Reown AppKit is running without a production Project ID. Injected wallets may work, but mobile WalletConnect handoff requires NEXT_PUBLIC_REOWN_PROJECT_ID in Vercel."
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig} reconnectOnMount>
      <QueryClientProvider client={queryClient}>
        <RitualProvider>{children}</RitualProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
