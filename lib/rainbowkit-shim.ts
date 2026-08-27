"use client";

import { useWalletModal } from "@/components/WalletModal";

export function useConnectModal() {
  const { openWalletModal } = useWalletModal();
  return { openConnectModal: openWalletModal };
}
