import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  type AppKitNetwork,
  defineChain,
} from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";

const LEGACY_PLACEHOLDER = "your_walletconnect_project_id_here";
const rawProjectId =
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ||
  process.env.NEXT_PUBLIC_WC_ID ||
  "";

export const reownConfigured =
  rawProjectId.length >= 24 && rawProjectId !== LEGACY_PLACEHOLDER;

// A real Reown Project ID is required for production mobile WalletConnect
// handoff. The fallback only keeps the pre-launch UI buildable while that
// public Project ID is added in Vercel.
export const projectId = reownConfigured
  ? rawProjectId
  : "00000000000000000000000000000000";

export const robinhoodNetwork = defineChain({
  id: 4663,
  caipNetworkId: "eip155:4663",
  chainNamespace: "eip155",
  name: "Robinhood Chain",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.mainnet.chain.robinhood.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://robinhoodchain.blockscout.com",
    },
  },
});

export const appKitNetworks = [robinhoodNetwork] as [
  AppKitNetwork,
  ...AppKitNetwork[],
];

export const wagmiAdapter = new WagmiAdapter({
  networks: appKitNetworks,
  projectId,
  ssr: true,
});

export const appKitMetadata = {
  name: "NULL RITE",
  description: "A persistent onchain ritual on Robinhood Chain.",
  url: "https://nullrite-web.vercel.app",
  icons: [
    "https://res.cloudinary.com/ugbfexbl/image/upload/v1787805854/rite-core.png",
  ],
};

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: appKitNetworks,
  defaultNetwork: robinhoodNetwork,
  metadata: appKitMetadata,
  projectId,
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
});
