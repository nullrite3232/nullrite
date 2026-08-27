"use client";

import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();

  if (isConnected && address) {
    const short = `${address.slice(0, 6)}…${address.slice(-4)}`;
    return (
      <button
        className="wallet"
        onClick={() => open({ view: "Account" })}
        title="Wallet account"
      >
        {short}
      </button>
    );
  }

  return (
    <button
      className="wallet"
      onClick={() => open({ view: "Connect", namespace: "eip155" })}
    >
      Connect Wallet
    </button>
  );
}
