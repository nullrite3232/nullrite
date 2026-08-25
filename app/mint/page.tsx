"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useChainId, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { parseEther, formatEther } from "viem";
import { RH_TESTNET_CHAIN } from "@/lib/chain";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Section, Container } from "@/components/layout/Container";
import { SITE, TERMS } from "@/lib/siteConfig";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

const VESSEL_NFT_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "quantity", type: "uint256" }],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "publicMintActive",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxMintPerWallet",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "mintPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const CONTRACT_ADDRESS = "0xd3E85fe5D282e1bc49F4A6B189272Ec874D29500" as const;
const TARGET_CHAIN_ID = 46630;

type MintStatus = "idle" | "wrong-chain" | "connect-wallet" | "mint-closed" | "ready" | "minting" | "success" | "error";

interface MintState {
  status: MintStatus;
  message: string;
  txHash?: string;
  balance?: bigint;
  totalSupply?: bigint;
  maxPerWallet?: bigint;
  mintPrice?: bigint;
  isMintActive?: boolean;
}

export default function Mint() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const [mintState, setMintState] = useState<MintState>({
    status: "idle",
    message: "",
  });
  const [quantity, setQuantity] = useState(1);
  const [isReading, setIsReading] = useState(true);

  const isWrongChain = chainId !== TARGET_CHAIN_ID;
  const isMinting = isPending || isConfirming;

  const readContractData = useCallback(async () => {
    try {
      const response = await fetch(`/api/contract-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: CONTRACT_ADDRESS,
          chainId: TARGET_CHAIN_ID,
          calls: [
            { functionName: "publicMintActive" },
            { functionName: "maxMintPerWallet" },
            { functionName: "totalSupply" },
            { functionName: "mintPrice" },
            ...(address ? [{ functionName: "balanceOf", args: [address] }] : []),
          ],
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMintState((prev) => ({
          ...prev,
          isMintActive: data.results[0],
          maxPerWallet: data.results[1],
          totalSupply: data.results[2],
          mintPrice: data.results[3],
          balance: address ? data.results[4] : undefined,
        }));
      }
    } catch (err) {
      console.error("Contract read error:", err);
    } finally {
      setIsReading(false);
    }
  }, [address]);

  useEffect(() => {
    readContractData();
  }, [readContractData]);

  useEffect(() => {
    if (isConfirmed && hash) {
      setMintState({
        status: "success",
        message: "Vessel summoned successfully!",
        txHash: hash,
      });
      readContractData();
    }
  }, [isConfirmed, hash, readContractData]);

  useEffect(() => {
    if (error) {
      let msg = "Transaction failed";
      const errMsg = error.message || "";
      if (errMsg.includes("mint not active")) msg = "Mint is not active yet";
      else if (errMsg.includes("max per wallet")) msg = "Max mint per wallet reached";
      else if (errMsg.includes("insufficient funds")) msg = "Insufficient ETH for mint";
      else if (errMsg.includes("quantity exceeds")) msg = "Quantity exceeds max per wallet";
      else msg = errMsg;

      setMintState({ status: "error", message: msg });
    }
  }, [error]);

  useEffect(() => {
    if (!isConnected) {
      setMintState({ status: "connect-wallet", message: "Connect your wallet to begin" });
    } else if (isWrongChain) {
      setMintState({ status: "wrong-chain", message: `Switch to ${RH_TESTNET_CHAIN.name} (Chain ID: ${TARGET_CHAIN_ID})` });
    } else if (mintState.isMintActive === false) {
      setMintState({ status: "mint-closed", message: "Public mint is not active yet" });
    } else if (isMinting) {
      setMintState((prev) => ({ ...prev, status: "minting", message: "Confirming transaction..." }));
    } else if (mintState.status !== "success" && mintState.status !== "error") {
      setMintState({ status: "ready", message: "Ready to summon" });
    }
  }, [isConnected, isWrongChain, mintState.isMintActive, isMinting, isConfirmed]);

  const handleMint = async () => {
    if (!isConnected || isWrongChain || !mintState.isMintActive) return;

    try {
      const mintPrice = mintState.mintPrice || parseEther(String(SITE.mintPriceEth));
      const totalCost = mintPrice * BigInt(quantity);

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: VESSEL_NFT_ABI,
        functionName: "mint",
        args: [BigInt(quantity)],
        value: totalCost,
        chainId: TARGET_CHAIN_ID,
      });
    } catch (err) {
      console.error("Mint error:", err);
      setMintState({ status: "error", message: "Failed to initiate mint" });
    }
  };

  const handleSwitchChain = () => {
    switchChain({ chainId: TARGET_CHAIN_ID });
  };

  const mintPriceEth = mintState.mintPrice ? formatEther(mintState.mintPrice) : String(SITE.mintPriceEth);
  const totalCost = (parseFloat(mintPriceEth) * quantity).toFixed(4);

  return (
    <>
      <Section variant="dark" padding="xl" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial" aria-hidden="true" />
        <div className="relative max-w-3xl mx-auto text-center">
          <span className="sec-tag animate-fade-in">{TERMS.mint}</span>
          <h1 className="h1 animate-slide-up delay-100">{TERMS.mintCta}</h1>
          <p className="p-lg animate-slide-up delay-200">
            Summon your Vessel. Max {SITE.maxMintPerWallet} per wallet. Cost: {SITE.mintPriceEth} ETH each.
          </p>
        </div>
      </Section>

      <Section padding="xl">
        <Container size="md">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card variant="elevated" padding="lg">
                <CardHeader>
                  <CardTitle>{TERMS.mintPriceLabel}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-dim2">Price per Vessel</span>
                    <span className="font-mono text-2xl text-acid">{mintPriceEth} ETH</span>
                  </div>
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-dim2">Quantity</span>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </Button>
                      <span className="font-mono text-2xl text-off w-12 text-center">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity((q) => Math.min(Number(mintState.maxPerWallet || SITE.maxMintPerWallet) - (Number(mintState.balance || 0)), q + 1))}
                        disabled={quantity >= Number(mintState.maxPerWallet || SITE.maxMintPerWallet) - Number(mintState.balance || 0)}
                        aria-label="Increase quantity"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                  <div className="border-t border-line pt-4 flex items-center justify-between text-xl">
                    <span className="text-dim2">Total</span>
                    <span className="font-mono text-2xl text-off">{totalCost} ETH</span>
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated" padding="lg">
                <CardHeader>
                  <CardTitle>SUMMONING STATUS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-panel2 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${
                      mintState.isMintActive ? "bg-acid" : "bg-dim"
                    }`} aria-hidden="true" />
                    <div>
                      <div className="font-mono text-sm text-off">
                        {mintState.isMintActive ? "PUBLIC MINT ACTIVE" : "MINT CLOSED"}
                      </div>
                      <div className="text-dim2 text-sm">
                        {mintState.isMintActive
                          ? "Vessels are accepting summons"
                          : "Await the Assembly completion"}
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-panel2 rounded-lg">
                      <div className="font-mono text-2xl text-acid">
                        {mintState.totalSupply ? mintState.totalSupply.toString() : "—"}
                      </div>
                      <div className="text-dim2 text-xs">MINTED</div>
                    </div>
                    <div className="p-3 bg-panel2 rounded-lg">
                      <div className="font-mono text-2xl text-acid">
                        {SITE.supply - Number(mintState.totalSupply || 0)}
                      </div>
                      <div className="text-dim2 text-xs">REMAINING</div>
                    </div>
                    <div className="p-3 bg-panel2 rounded-lg">
                      <div className="font-mono text-2xl text-acid">
                        {mintState.maxPerWallet ? mintState.maxPerWallet.toString() : SITE.maxMintPerWallet}
                      </div>
                      <div className="text-dim2 text-xs">MAX / WALLET</div>
                    </div>
                  </div>
                  {address && (
                    <div className="p-4 bg-panel2 rounded-lg border border-line2">
                      <div className="flex items-center justify-between">
                        <span className="text-dim2">Your Vessels</span>
                        <span className="font-mono text-2xl text-off">
                          {mintState.balance?.toString() || "0"} / {mintState.maxPerWallet?.toString() || SITE.maxMintPerWallet}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card variant="elevated" padding="lg" className="sticky top-24">
                <div className="space-y-4">
                  {mintState.status === "connect-wallet" && (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-panel2 flex items-center justify-center text-dim">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-mono text-lg text-off">CONNECT WALLET</h3>
                        <p className="text-dim2 text-sm mt-1">Connect to begin the Rite</p>
                      </div>
                      <div className="w-full max-w-xs mx-auto">
                        <ConnectButton showBalance={false} />
                      </div>
                    </div>
                  )}

                  {mintState.status === "wrong-chain" && (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-panel2 flex items-center justify-center text-violet">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-mono text-lg text-off">WRONG NETWORK</h3>
                        <p className="text-dim2 text-sm mt-1">{mintState.message}</p>
                      </div>
                      <Button variant="primary" className="w-full" onClick={handleSwitchChain}>
                        SWITCH TO {RH_TESTNET_CHAIN.name.toUpperCase()}
                      </Button>
                    </div>
                  )}

                  {mintState.status === "mint-closed" && (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-panel2 flex items-center justify-center text-dim">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-mono text-lg text-off">MINT CLOSED</h3>
                        <p className="text-dim2 text-sm mt-1">{mintState.message}</p>
                      </div>
                    </div>
                  )}

                  {(mintState.status === "ready" || mintState.status === "minting") && (
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      onClick={handleMint}
                      disabled={isMinting || !mintState.isMintActive}
                      loading={isMinting}
                    >
                      {isMinting ? "SUMMONING..." : `SUMMON ${quantity} VESSEL${quantity > 1 ? "S" : ""}`}
                    </Button>
                  )}

                  {mintState.status === "success" && (
                    <div className="text-center space-y-4 animate-fade-in">
                      <div className="w-16 h-16 mx-auto rounded-full bg-acid/10 flex items-center justify-center text-acid">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-mono text-lg text-acid">VESSEL SUMMONED</h3>
                        <p className="text-dim2 text-sm mt-1">{TERMS.postMint}</p>
                      </div>
                      {mintState.txHash && (
                        <a
                          href={`https://testnet.blockscout.robinhood.com/tx/${mintState.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-dim hover:text-acid text-sm font-mono transition-colors"
                        >
                          View Transaction →
                        </a>
                      )}
                      <Button variant="ghost" className="w-full" onClick={() => reset()}>
                        SUMMON ANOTHER
                      </Button>
                    </div>
                  )}

                  {mintState.status === "error" && (
                    <div className="text-center space-y-4 animate-fade-in">
                      <div className="w-16 h-16 mx-auto rounded-full bg-magenta/10 flex items-center justify-center text-magenta">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-mono text-lg text-magenta">SUMMONING FAILED</h3>
                        <p className="text-dim2 text-sm mt-1">{mintState.message}</p>
                      </div>
                      <Button variant="ghost" className="w-full" onClick={() => reset()}>
                        TRY AGAIN
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              <Card variant="outlined" padding="md">
                <div className="font-mono text-xs tracking-widest text-acid mb-3">QUICK ACTIONS</div>
                <div className="space-y-2">
                  <Link href="/collection">
                    <Button variant="ghost" className="w-full justify-start">VIEW COLLECTION</Button>
                  </Link>
                  <Link href="/gate">
                    <Button variant="ghost" className="w-full justify-start">CHECK THE GATE</Button>
                  </Link>
                  <Link href="/verify">
                    <Button variant="ghost" className="w-full justify-start">VERIFY CONTRACT</Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}