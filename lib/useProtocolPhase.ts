"use client";

import { useReadContract } from "wagmi";
import { RUNTIME } from "@/lib/runtime";
import { SITE } from "@/lib/siteConfig";

const PROTOCOL_ABI = [
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "publicMintActive",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "summoningStarted",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "revealed",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export type SummoningState = "PRE_LAUNCH" | "OPEN" | "PAUSED" | "COMPLETE";
export type AssemblyState = "SEALED" | "FORMING" | "COMPLETE";
export type RevealState = "SEALED" | "REVEALED";
export type PublicPhase =
  | "PRE_LAUNCH"
  | "SUMMONING"
  | "SUMMONING_PAUSED"
  | "ASSEMBLY_COMPLETE"
  | "REVEALED";

const protocolReadQuery = {
  enabled: RUNTIME.contractConfigured,
  refetchInterval: 8_000,
  retry: 3,
} as const;

export function useProtocolPhase() {
  // Keep these as independent reads instead of one fail-all multicall. The
  // public testnet RPC can intermittently reject a batched read; one transport
  // failure must not make a revealed/sold-out preview look PRE_LAUNCH again.
  const totalSupplyRead = useReadContract({
    address: RUNTIME.contractAddress,
    abi: PROTOCOL_ABI,
    functionName: "totalSupply",
    chainId: RUNTIME.chain.id,
    query: protocolReadQuery,
  });

  const publicMintActiveRead = useReadContract({
    address: RUNTIME.contractAddress,
    abi: PROTOCOL_ABI,
    functionName: "publicMintActive",
    chainId: RUNTIME.chain.id,
    query: protocolReadQuery,
  });

  const summoningStartedRead = useReadContract({
    address: RUNTIME.contractAddress,
    abi: PROTOCOL_ABI,
    functionName: "summoningStarted",
    chainId: RUNTIME.chain.id,
    query: protocolReadQuery,
  });

  const revealedRead = useReadContract({
    address: RUNTIME.contractAddress,
    abi: PROTOCOL_ABI,
    functionName: "revealed",
    chainId: RUNTIME.chain.id,
    query: protocolReadQuery,
  });

  const totalSupply = totalSupplyRead.data;
  const publicMintActiveResult = publicMintActiveRead.data;
  const summoningStartedResult = summoningStartedRead.data;
  const revealedResult = revealedRead.data;

  const contractStateSynced =
    typeof totalSupply === "bigint" &&
    typeof publicMintActiveResult === "boolean" &&
    typeof summoningStartedResult === "boolean" &&
    typeof revealedResult === "boolean";

  const minted = contractStateSynced
    ? Math.max(0, Math.min(Number(totalSupply), SITE.supply))
    : null;
  const publicMintActive = contractStateSynced ? publicMintActiveResult : false;
  const summoningStarted = contractStateSynced ? summoningStartedResult : false;
  const revealed = contractStateSynced ? revealedResult : false;
  const isSoldOut = contractStateSynced && minted !== null && minted >= SITE.supply;
  const remaining = minted === null ? null : Math.max(0, SITE.supply - minted);
  const progress = minted === null
    ? 0
    : Math.min(100, Math.max(0, (minted / SITE.supply) * 100));

  const summoningState: SummoningState = isSoldOut
    ? "COMPLETE"
    : publicMintActive
      ? "OPEN"
      : summoningStarted
        ? "PAUSED"
        : "PRE_LAUNCH";

  const assemblyState: AssemblyState = isSoldOut
    ? "COMPLETE"
    : summoningStarted
      ? "FORMING"
      : "SEALED";

  const revealState: RevealState = revealed ? "REVEALED" : "SEALED";

  const publicPhase: PublicPhase = revealed
    ? "REVEALED"
    : isSoldOut
      ? "ASSEMBLY_COMPLETE"
      : publicMintActive
        ? "SUMMONING"
        : summoningStarted
          ? "SUMMONING_PAUSED"
          : "PRE_LAUNCH";

  const error =
    totalSupplyRead.error ??
    publicMintActiveRead.error ??
    summoningStartedRead.error ??
    revealedRead.error ??
    null;

  const isLoading =
    totalSupplyRead.isLoading ||
    publicMintActiveRead.isLoading ||
    summoningStartedRead.isLoading ||
    revealedRead.isLoading;

  const refetch = async () => {
    await Promise.all([
      totalSupplyRead.refetch(),
      publicMintActiveRead.refetch(),
      summoningStartedRead.refetch(),
      revealedRead.refetch(),
    ]);
  };

  return {
    minted,
    remaining,
    progress,
    publicMintActive,
    summoningStarted,
    revealed,
    isSoldOut,
    summoningState,
    assemblyState,
    revealState,
    publicPhase,
    contractStateSynced,
    isLoading,
    error,
    refetch,
  };
}
