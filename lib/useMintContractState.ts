"use client";

import { useEffect, useMemo, useState } from "react";
import { parseEther } from "viem";
import { usePublicClient, useReadContracts } from "wagmi";
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

  const reads = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: contractAddress,
        abi: VESSEL_MINT_ABI,
        functionName: "mintPrice",
        chainId: RUNTIME.chain.id,
      },
      {
        address: contractAddress,
        abi: VESSEL_MINT_ABI,
        functionName: "maxPerTx",
        chainId: RUNTIME.chain.id,
      },
      {
        address: contractAddress,
        abi: VESSEL_MINT_ABI,
        functionName: "maxPerWallet",
        chainId: RUNTIME.chain.id,
      },
      {
        address: contractAddress,
        abi: VESSEL_MINT_ABI,
        functionName: "publicMintActive",
        chainId: RUNTIME.chain.id,
      },
    ],
    query: {
      enabled: RUNTIME.contractConfigured && enabled,
      refetchInterval: 8_000,
    },
  });

  const results = reads.data as
    | readonly [bigint, bigint, bigint, boolean]
    | undefined;

  const contractStateSynced = Boolean(results) && !reads.error;
  const mintPriceWei = results?.[0] ?? parseEther(SITE.mintPriceEth.toString());
  const maxPerTx = Math.max(1, Number(results?.[1] ?? BigInt(SITE.maxPerTx)));
  const maxPerWallet = Math.max(
    1,
    Number(results?.[2] ?? BigInt(SITE.maxMintPerWallet))
  );

  // Production safety rule: unknown contract state is SEALED, never OPEN.
  const publicMintActive = contractStateSynced ? Boolean(results?.[3]) : false;

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

  return {
    mintPriceWei,
    maxPerTx,
    maxPerWallet,
    publicMintActive,
    contractStateSynced,
    isContractStateLoading: reads.isLoading,
    contractStateError: reads.error,
    walletAllowance,
    isAllowanceLoading,
    allowanceCheckError,
  };
}
