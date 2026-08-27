"use client";

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import { RitualOverlay } from "@/components/RitualOverlay";
import { SummoningPreviewOverlay } from "@/components/SummoningPreviewOverlay";
import { SITE } from "@/lib/siteConfig";

type RitualCtxValue = { open: () => void };

const RitualCtx = createContext<RitualCtxValue>({ open: () => {} });

export function useRitual() {
  return useContext(RitualCtx);
}

export function RitualProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const value = useMemo(() => ({ open }), [open]);
  const close = () => setIsOpen(false);

  return (
    <RitualCtx.Provider value={value}>
      {children}
      {SITE.publicSummoningEnabled ? (
        <RitualOverlay open={isOpen} onClose={close} />
      ) : (
        <SummoningPreviewOverlay open={isOpen} onClose={close} />
      )}
    </RitualCtx.Provider>
  );
}
