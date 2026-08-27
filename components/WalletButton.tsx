"use client";

import { useAccount } from "wagmi";
import { useWalletModal } from "@/components/WalletModal";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { openWalletModal } = useWalletModal();

  if (isConnected && address) {
    return (
      <button className="wallet" onClick={openWalletModal} title="Wallet account">
        {`${address.slice(0, 6)}…${address.slice(-4)}`}
      </button>
    );
  }

  return (
    <button className="wallet" onClick={openWalletModal}>
      Connect Wallet
    </button>
  );
}
