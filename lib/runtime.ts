import { RH_CHAIN } from "@/lib/chain";

// MAINNET FRONTEND PREP.
// The production site is pinned to Robinhood Chain mainnet. The contract address
// stays environment-driven so no testnet address can leak into production source.
export const ACTIVE_CHAIN = RH_CHAIN;

const rawContractAddress =
  process.env.NEXT_PUBLIC_NULLRITE_ADDRESS?.trim() ?? "";

export const CONTRACT_CONFIGURED = /^0x[0-9a-fA-F]{40}$/.test(
  rawContractAddress
);

export const CONTRACT_ADDRESS = (
  CONTRACT_CONFIGURED
    ? rawContractAddress
    : "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

export const ACTIVE_EXPLORER = ACTIVE_CHAIN.blockExplorers.default.url;

export function transactionExplorerUrl(hash: string) {
  return `${ACTIVE_EXPLORER}/tx/${hash}`;
}

export function contractExplorerUrl(address: string = CONTRACT_ADDRESS) {
  return `${ACTIVE_EXPLORER}/address/${address}`;
}

export const RUNTIME = {
  network: "mainnet" as const,
  chain: ACTIVE_CHAIN,
  contractAddress: CONTRACT_ADDRESS,
  contractConfigured: CONTRACT_CONFIGURED,
  isTestnet: false,
  isMainnet: true,
} as const;
