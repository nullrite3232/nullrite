"use client";

import { useReadContracts } from "wagmi";
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

export function useProtocolPhase() {
  const read = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: RUNTIME.contractAddress,
        abi: PROTOCOL_ABI,
        functionName: "totalSupply",
        chainId: RUNTIME.chain.id,
      },
      {
        address: RUNTIME.contractAddress,
        abi: PROTOCOL_ABI,
        functionName: "publicMintActive",
        chainId: RUNTIME.chain.id,
      },
      {
        address: RUNTIME.contractAddress,
        abi: PROTOCOL_ABI,
        functionName: "summoningStarted",
        chainId: RUNTIME.chain.id,
      },
      {
        address: RUNTIME.contractAddress,
        abi: PROTOCOL_ABI,
        functionName: "revealed",
        chainId: RUNTIME.chain.id,
      },
    ],
    query: {
      enabled: RUNTIME.contractConfigured,
      refetchInterval: 8_000,
    },
  });

  const results = read.data as
    | readonly [bigint, boolean, boolean, boolean]
    | undefined;

  const contractStateSynced = Boolean(results) && !read.error;
  const minted = contractStateSynced
    ? Math.max(0, Math.min(Number(results?.[0] ?? 0n), SITE.supply))
    : null;
  const publicMintActive = contractStateSynced ? Boolean(results?.[1]) : false;
  const summoningStarted = contractStateSynced ? Boolean(results?.[2]) : false;
  const revealed = contractStateSynced ? Boolean(results?.[3]) : false;
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
    isLoading: read.isLoading,
    error: read.error,
    refetch: read.refetch,
  };
}
