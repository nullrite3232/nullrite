"use client";

import { parseEther, zeroAddress } from "viem";
import { useReadContract } from "wagmi";
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
    name: "mintedByWallet",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
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

export function useMintContractState({
  address,
  enabled,
  remaining: _remaining,
}: {
  address?: Address;
  enabled: boolean;
  remaining: number | null;
}) {
  const contractAddress = RUNTIME.contractAddress;

  // Keep production reads independent. One failed non-critical read must not
  // seal the entire mint UI.
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

  const liveContractStateSynced =
    hasMintPrice &&
    hasMaxPerTx &&
    hasMaxPerWallet &&
    hasPublicMintActive &&
    hasRevealed;

  // Summoning has already been activated onchain and these configuration
  // values are locked by the contract once summoning starts. SITE values are a
  // safe display/control fallback if a provider read temporarily fails. The
  // contract remains the final authority for every mint transaction.
  const usingProductionFallback =
    SITE.publicSummoningEnabled && !liveContractStateSynced;
  const contractStateSynced =
    liveContractStateSynced || SITE.publicSummoningEnabled;

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

  const publicMintActive = liveContractStateSynced
    ? Boolean(publicMintActiveRead.data)
    : SITE.publicSummoningEnabled;
  const summoningStarted =
    typeof summoningStartedRead.data === "boolean"
      ? summoningStartedRead.data
      : SITE.publicSummoningEnabled;
  const revealed = liveContractStateSynced ? Boolean(revealedRead.data) : false;

  // Read the contract's public mintedByWallet mapping directly instead of
  // simulating mint(10), mint(9), ... mint(1). The old simulation loop could
  // leave the UI stuck on CHECKING even though the wallet was valid. This is a
  // single lightweight eth_call and gives the exact remaining lifetime limit.
  const walletMintedRead = useReadContract({
    address: contractAddress,
    abi: VESSEL_MINT_ABI,
    functionName: "mintedByWallet",
    args: [address ?? zeroAddress],
    chainId: RUNTIME.chain.id,
    query: {
      enabled:
        RUNTIME.contractConfigured &&
        enabled &&
        Boolean(address) &&
        publicMintActive,
      refetchInterval: 8_000,
      retry: 2,
    },
  });

  const walletMinted =
    typeof walletMintedRead.data === "bigint"
      ? Number(walletMintedRead.data)
      : null;

  const walletAllowance = !address
    ? null
    : walletMinted === null
      ? null
      : Math.max(0, maxPerWallet - walletMinted);

  const isAllowanceLoading = Boolean(
    address && publicMintActive && walletMintedRead.isLoading
  );

  const allowanceCheckError = walletMintedRead.error
    ? "Live wallet allowance is temporarily unavailable. The contract will verify the transaction."
    : null;

  const readErrors = [
    mintPriceRead.error,
    maxPerTxRead.error,
    maxPerWalletRead.error,
    publicMintActiveRead.error,
    revealedRead.error,
  ].filter(Boolean);

  const liveReadsLoading =
    mintPriceRead.isLoading ||
    maxPerTxRead.isLoading ||
    maxPerWalletRead.isLoading ||
    publicMintActiveRead.isLoading ||
    revealedRead.isLoading;

  // Once production has intentionally been activated, provider loading is
  // informational only and must not disable the mint controls.
  const isContractStateLoading =
    liveReadsLoading && !SITE.publicSummoningEnabled;

  return {
    mintPriceWei,
    maxPerTx,
    maxPerWallet,
    publicMintActive,
    summoningStarted,
    revealed,
    contractStateSynced,
    liveContractStateSynced,
    usingProductionFallback,
    isContractStateLoading,
    contractStateError: readErrors[0] ?? null,
    walletAllowance,
    isAllowanceLoading,
    allowanceCheckError,
  };
}
