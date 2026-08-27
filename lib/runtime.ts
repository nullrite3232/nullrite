import { RH_CHAIN, RH_TESTNET_CHAIN } from "@/lib/chain";

export type NullRiteNetwork = "testnet" | "mainnet";

const requestedNetwork =
  process.env.NEXT_PUBLIC_NULLRITE_NETWORK?.trim().toLowerCase() ?? "";

// Safe default while the project is being rehearsed: never fall through to mainnet.
export const NULLRITE_NETWORK: NullRiteNetwork =
  requestedNetwork === "mainnet" ? "mainnet" : "testnet";

export const ACTIVE_CHAIN =
  NULLRITE_NETWORK === "mainnet" ? RH_CHAIN : RH_TESTNET_CHAIN;

const rawContractAddress =
  process.env.NEXT_PUBLIC_NULLRITE_ADDRESS?.trim() ?? "";

export const CONTRACT_CONFIGURED = /^0x[a-fA-F0-9]{40}$/.test(
  rawContractAddress
);

// A valid placeholder keeps wagmi/viem hook configuration safe when no contract
// has been configured yet. Reads/writes remain disabled by CONTRACT_CONFIGURED.
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
  network: NULLRITE_NETWORK,
  chain: ACTIVE_CHAIN,
  contractAddress: CONTRACT_ADDRESS,
  contractConfigured: CONTRACT_CONFIGURED,
  isTestnet: NULLRITE_NETWORK === "testnet",
  isMainnet: NULLRITE_NETWORK === "mainnet",
} as const;
