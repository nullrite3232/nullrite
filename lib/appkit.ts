import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { defineChain } from "@reown/appkit/networks";

const LEGACY_PLACEHOLDER = "your_walletconnect_project_id_here";
const rawProjectId =
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ||
  process.env.NEXT_PUBLIC_WC_ID ||
  "";

export const reownConfigured =
  rawProjectId.length >= 24 && rawProjectId !== LEGACY_PLACEHOLDER;

// AppKit requires a projectId at initialization time. This fallback keeps the
// injected-wallet path renderable while the real Reown Cloud ID is being added
// to Vercel. Mobile WalletConnect handoff requires a real project ID.
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

export const appKitNetworks = [robinhoodNetwork] as [typeof robinhoodNetwork];

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
