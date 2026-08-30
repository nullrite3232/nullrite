"use client";

import { useProtocolPhase } from "@/lib/useProtocolPhase";

export function useAssemblySupply() {
  const phase = useProtocolPhase();

  return {
    minted: phase.minted,
    remaining: phase.remaining,
    progress: phase.progress,
    refetch: phase.refetch,
    isLoading: phase.isLoading,
    error: phase.error,
  };
}
