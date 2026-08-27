"use client";

import { useReadContract } from "wagmi";
import { RH_TESTNET_CHAIN } from "@/lib/chain";
import { SITE } from "@/lib/siteConfig";

const SUPPLY_ABI = [
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export function useAssemblySupply() {
  const read = useReadContract({
    address: SITE.contractAddress as `0x${string}`,
    abi: SUPPLY_ABI,
    functionName: "totalSupply",
    chainId: RH_TESTNET_CHAIN.id,
    query: {
      enabled: Boolean(SITE.contractAddress),
      refetchInterval: 8_000,
    },
  });

  const minted = typeof read.data === "bigint" ? Number(read.data) : null;
  const remaining = minted === null ? null : Math.max(0, SITE.supply - minted);
  const progress = minted === null ? 0 : Math.min(100, Math.max(0, (minted / SITE.supply) * 100));

  return {
    minted,
    remaining,
    progress,
    refetch: read.refetch,
    isLoading: read.isLoading,
    error: read.error,
  };
}
