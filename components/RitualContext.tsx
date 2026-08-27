"use client";

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import { RitualOverlay } from "@/components/RitualOverlay";

type RitualCtxValue = { open: () => void };

const RitualCtx = createContext<RitualCtxValue>({ open: () => {} });

export function useRitual() {
  return useContext(RitualCtx);
}

export function RitualProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const value = useMemo(() => ({ open }), [open]);

  return (
    <RitualCtx.Provider value={value}>
      {children}
      <RitualOverlay open={isOpen} onClose={() => setIsOpen(false)} />
    </RitualCtx.Provider>
  );
}
