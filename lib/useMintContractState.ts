"use client";

import { useEffect, useMemo, useState } from "react";
import { parseEther } from "viem";
import { usePublicClient, useReadContract } from "wagmi";
import { RUNTIME } from "@/lib/runtime";
import { SITE } from "@/lib/siteConfig";

export const VESSEL_MINT_ABI = [
  {
    type: "function",
    name: "mint",
    stateMutability: "payable",
    inputs: [{ name: "quantity", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "mintPrice",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "maxPerTx",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "maxPerWallet",
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

type Address = `0x${string}`;

function looksLikeTransportFailure(error: unknown) {
  const message =
    error instanceof Error
      ? `${error.name} ${error.message}`.toLowerCase()
      : String(error).toLowerCase();

  return [
    "http request failed",
    "network",
    "timeout",
    "timed out",
    "fetch failed",
    "connection",
    "rate limit",
    "429",
    "502",
    "503",
  ].some((needle) => message.includes(needle));
}

export function useMintContractState({
  address,
  enabled,
  remaining,
}: {
  address?: Address;
  enabled: boolean;
  remaining: number | null;
}) {
  const contractAddress = RUNTIME.contractAddress;
  const publicClient = usePublicClient({ chainId: RUNTIME.chain.id });

  // Keep production mint reads independent. Robinhood's public RPC has shown
  // intermittent issues with batched/multicall reads; one failed non-critical
  // read must not seal the entire mint UI.
  const readQuery = {
    enabled: RUNTIME.contractConfigured && enabled,
    refetchInterval: 8_000,
    retry: 3,
  } as const;

  const mintPriceRead = useReadContract({
    address: contractAddress,
    abi: VESSEL_MINT_ABI,
    functionName: "mintPrice",
    chainId: RUNTIME.chain.id,
    query: readQuery,
  });

  const maxPerTxRead = useReadContract({
    address: contractAddress,
    abi: VESSEL_MINT_ABI,
    functionName: "maxPerTx",
    chainId: RUNTIME.chain.id,
    query: readQuery,
  });

  const maxPerWalletRead = useReadContract({
    address: contractAddress,
    abi: VESSEL_MINT_ABI,
    functionName: "maxPerWallet",
    chainId: RUNTIME.chain.id,
    query: readQuery,
  });

  const publicMintActiveRead = useReadContract({
    address: contractAddress,
    abi: VESSEL_MINT_ABI,
    functionName: "publicMintActive",
    chainId: RUNTIME.chain.id,
    query: readQuery,
  });

  const summoningStartedRead = useReadContract({
    address: contractAddress,
    abi: VESSEL_MINT_ABI,
    functionName: "summoningStarted",
    chainId: RUNTIME.chain.id,
    query: readQuery,
  });

  const revealedRead = useReadContract({
    address: contractAddress,
    abi: VESSEL_MINT_ABI,
    functionName: "revealed",
    chainId: RUNTIME.chain.id,
    query: readQuery,
  });

  const hasMintPrice = typeof mintPriceRead.data === "bigint";
  const hasMaxPerTx = typeof maxPerTxRead.data === "bigint";
  const hasMaxPerWallet = typeof maxPerWalletRead.data === "bigint";
  const hasPublicMintActive = typeof publicMintActiveRead.data === "boolean";
  const hasRevealed = typeof revealedRead.data === "boolean";

  // Only mint-critical reads gate transaction readiness. summoningStarted is a
  // phase/display signal and must not block a valid open mint if that one read
  // temporarily fails.
  const contractStateSynced =
    hasMintPrice &&
    hasMaxPerTx &&
    hasMaxPerWallet &&
    hasPublicMintActive &&
    hasRevealed;

  const mintPriceWei =
    mintPriceRead.data ?? parseEther(SITE.mintPriceEth.toString());
  const maxPerTx = Math.max(
    1,
    Number(maxPerTxRead.data ?? BigInt(SITE.maxPerTx))
  );
  const maxPerWallet = Math.max(
    1,
    Number(maxPerWalletRead.data ?? BigInt(SITE.maxMintPerWallet))
  );

  // Unknown mint-critical contract state remains fail-closed for transactions.
  const publicMintActive = contractStateSynced
    ? Boolean(publicMintActiveRead.data)
    : false;
  const summoningStarted =
    typeof summoningStartedRead.data === "boolean"
      ? summoningStartedRead.data
      : SITE.publicSummoningEnabled;
  const revealed = contractStateSynced ? Boolean(revealedRead.data) : false;

  const probeCeiling = useMemo(() => {
    if (!publicMintActive) return 0;
    if (remaining === null) return maxPerTx;
    return Math.max(0, Math.min(maxPerTx, remaining));
  }, [maxPerTx, publicMintActive, remaining]);

  const [walletAllowance, setWalletAllowance] = useState<number | null>(null);
  const [isAllowanceLoading, setIsAllowanceLoading] = useState(false);
  const [allowanceCheckError, setAllowanceCheckError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !address) {
      setWalletAllowance(null);
      setIsAllowanceLoading(false);
      setAllowanceCheckError(null);
      return;
    }

    if (!RUNTIME.contractConfigured || !contractStateSynced || !publicMintActive) {
      setWalletAllowance(null);
      setIsAllowanceLoading(false);
      setAllowanceCheckError(null);
      return;
    }

    if (probeCeiling === 0) {
      setWalletAllowance(0);
      setIsAllowanceLoading(false);
      setAllowanceCheckError(null);
      return;
    }

    if (!publicClient) {
      setWalletAllowance(null);
      setIsAllowanceLoading(false);
      setAllowanceCheckError("Wallet allowance could not be checked.");
      return;
    }

    let cancelled = false;

    const probeAllowance = async () => {
      setIsAllowanceLoading(true);
      setAllowanceCheckError(null);

      for (let candidate = probeCeiling; candidate >= 1; candidate -= 1) {
        try {
          await publicClient.simulateContract({
            address: contractAddress,
            abi: VESSEL_MINT_ABI,
            functionName: "mint",
            args: [BigInt(candidate)],
            account: address,
            value: mintPriceWei * BigInt(candidate),
          });

          if (!cancelled) {
            setWalletAllowance(candidate);
            setIsAllowanceLoading(false);
          }
          return;
        } catch (error) {
          if (looksLikeTransportFailure(error)) {
            if (!cancelled) {
              setWalletAllowance(null);
              setAllowanceCheckError(
                "Live wallet allowance is temporarily unavailable. The contract will still verify the transaction."
              );
              setIsAllowanceLoading(false);
            }
            return;
          }
        }
      }

      if (!cancelled) {
        setWalletAllowance(0);
        setIsAllowanceLoading(false);
      }
    };

    void probeAllowance();

    return () => {
      cancelled = true;
    };
  }, [
    address,
    contractAddress,
    contractStateSynced,
    enabled,
    mintPriceWei,
    probeCeiling,
    publicClient,
    publicMintActive,
  ]);

  const readErrors = [
    mintPriceRead.error,
    maxPerTxRead.error,
    maxPerWalletRead.error,
    publicMintActiveRead.error,
    revealedRead.error,
  ].filter(Boolean);

  const isContractStateLoading =
    mintPriceRead.isLoading ||
    maxPerTxRead.isLoading ||
    maxPerWalletRead.isLoading ||
    publicMintActiveRead.isLoading ||
    revealedRead.isLoading;

  return {
    mintPriceWei,
    maxPerTx,
    maxPerWallet,
    publicMintActive,
    summoningStarted,
    revealed,
    contractStateSynced,
    isContractStateLoading,
    contractStateError: readErrors[0] ?? null,
    walletAllowance,
    isAllowanceLoading,
    allowanceCheckError,
  };
}
