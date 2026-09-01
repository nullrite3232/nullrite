"use client";

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import { RitualOverlay } from "@/components/RitualOverlay";
import { SummoningPreviewOverlay } from "@/components/SummoningPreviewOverlay";
import { SITE } from "@/lib/siteConfig";
import { useProtocolPhase } from "@/lib/useProtocolPhase";

type RitualCtxValue = { open: () => void };

const RitualCtx = createContext<RitualCtxValue>({ open: () => {} });

export function useRitual() {
  return useContext(RitualCtx);
}

export function RitualProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const phase = useProtocolPhase();

  const openAssembly = useCallback(() => {
    if (typeof window === "undefined") return;
    history.replaceState(null, "", location.pathname + location.search + "#/collection");
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("nullrite:collection-mode", { detail: "all" })
      );
    }, 0);
  }, []);

  const open = useCallback(() => {
    if (phase.isSoldOut || phase.revealed) {
      openAssembly();
      return;
    }
    setIsOpen(true);
  }, [openAssembly, phase.isSoldOut, phase.revealed]);

  const value = useMemo(() => ({ open }), [open]);
  const close = () => setIsOpen(false);

  // Once production Summoning has been intentionally enabled, never regress
  // the user-facing overlay to the pre-launch preview solely because a public
  // RPC read was temporarily unavailable. The live RitualOverlay remains
  // fail-closed and verifies contract state before it can submit a mint.
  const useLiveSummoning =
    SITE.publicSummoningEnabled ||
    phase.summoningStarted ||
    phase.publicMintActive;

  return (
    <RitualCtx.Provider value={value}>
      {children}
      {useLiveSummoning ? (
        <RitualOverlay open={isOpen} onClose={close} />
      ) : (
        <SummoningPreviewOverlay open={isOpen} onClose={close} />
      )}
    </RitualCtx.Provider>
  );
}
