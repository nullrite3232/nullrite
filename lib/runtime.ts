import { RH_CHAIN, RH_TESTNET_CHAIN } from "@/lib/chain";

export type NullRiteNetwork = "testnet" | "mainnet";

// PHASE D REHEARSAL PREVIEW ONLY.
// Temporary branch pin. MUST NOT merge into main.
// Forces testnet + Phase D harness, ignoring stale Vercel Preview env.
export const NULLRITE_NETWORK: NullRiteNetwork = "testnet";

export const ACTIVE_CHAIN =
  (NULLRITE_NETWORK as NullRiteNetwork) === "mainnet"
    ? RH_CHAIN
    : RH_TESTNET_CHAIN;

// PHASE D REHEARSAL PREVIEW ONLY.
// Temporary branch pin. MUST NOT merge into main.
export const CONTRACT_CONFIGURED = true;

// PHASE D REHEARSAL PREVIEW ONLY.
// Temporary branch pin. MUST NOT merge into main.
export const CONTRACT_ADDRESS =
  "0x0ab741e1c3377854678958404e749c2a1e71e0e2" as `0x${string}`;

export const ACTIVE_EXPLORER = ACTIVE_CHAIN.blockExplorers.default.url;

export function transactionExplorerUrl(hash: string) {
  return `${ACTIVE_EXPLORER}/tx/${hash}`;
}

export function contractExplorerUrl(address: string = CONTRACT_ADDRESS) {
  return `${ACTIVE_EXPLORER}/address/${address}`;
}

export const RUNTIME = {
  network: NULLRITE_NETWORK,
  chain: ACTIVE_CHAIN,
  contractAddress: CONTRACT_ADDRESS,
  contractConfigured: CONTRACT_CONFIGURED,
  isTestnet: (NULLRITE_NETWORK as NullRiteNetwork) === "testnet",
  isMainnet: (NULLRITE_NETWORK as NullRiteNetwork) === "mainnet",
} as const;
