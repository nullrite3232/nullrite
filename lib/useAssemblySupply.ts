"use client";

import { useReadContract } from "wagmi";
import { RUNTIME } from "@/lib/runtime";
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
    address: RUNTIME.contractAddress,
    abi: SUPPLY_ABI,
    functionName: "totalSupply",
    chainId: RUNTIME.chain.id,
    query: {
      enabled: RUNTIME.contractConfigured,
      refetchInterval: 8_000,
    },
  });

  const minted = typeof read.data === "bigint" ? Number(read.data) : null;
  const remaining = minted === null ? null : Math.max(0, SITE.supply - minted);
  const progress = minted === null
    ? 0
    : Math.min(100, Math.max(0, (minted / SITE.supply) * 100));

  return {
    minted,
    remaining,
    progress,
    refetch: read.refetch,
    isLoading: read.isLoading,
    error: read.error,
  };
}
