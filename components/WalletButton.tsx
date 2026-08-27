"use client";

import { useAccount, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal() ?? {};

  if (isConnected && address) {
    const short = `${address.slice(0, 6)}…${address.slice(-4)}`;
    return (
      <button className="wallet" onClick={() => disconnect()} title="Disconnect">
        {short}
      </button>
    );
  }

  return (
    <button className="wallet" onClick={() => openConnectModal?.()}>
      Connect Wallet
    </button>
  );
}
