// Robinhood Chain config (verified via rh-chain-token-launch skill)
export const RH_CHAIN = {
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mainnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://robinhoodchain.blockscout.com" },
  },
} as const;

// Set after deploy (Vercel project env).
export const CONTRACT_ADDRESS: string =
  process.env.NEXT_PUBLIC_NULLRITE_ADDRESS ?? "";

export const IPFS_GATEWAY: string =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://ipfs.io/ipfs/";

export function ipfsUrl(uri: string): string {
  return IPFS_GATEWAY + uri.replace(/^ipfs:\/\//, "");
}
