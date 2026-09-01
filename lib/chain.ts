// Robinhood Chain official public RPC. Keep this as wallet/network metadata so
// external wallets are never forced to use the browser-restricted Alchemy key.
export const RH_PUBLIC_RPC_URL = "https://rpc.mainnet.chain.robinhood.com";

// Production dapp reads may use a dedicated provider first. This NEXT_PUBLIC
// value is intentionally browser-visible; protect it with an Alchemy domain
// allowlist. If it is absent, the official Robinhood RPC remains the only
// transport. The official RPC is always retained as a fallback.
const configuredProductionRpc =
  process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL?.trim() ?? "";

export const RH_DAPP_RPC_URLS: readonly string[] =
  configuredProductionRpc.startsWith("https://")
    ? [configuredProductionRpc, RH_PUBLIC_RPC_URL]
    : [RH_PUBLIC_RPC_URL];

// Robinhood Chain mainnet.
export const RH_CHAIN = {
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [RH_PUBLIC_RPC_URL] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://robinhoodchain.blockscout.com" },
  },
} as const;

// Robinhood Chain testnet.
export const RH_TESTNET_CHAIN = {
  id: 46630,
  name: "Robinhood Testnet",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://explorer.testnet.chain.robinhood.com" },
  },
} as const;

export const IPFS_GATEWAY: string =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://ipfs.io/ipfs/";

export function ipfsUrl(uri: string): string {
  return IPFS_GATEWAY + uri.replace(/^ipfs:\/\//, "");
}
