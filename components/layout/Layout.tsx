"use client";

import { ReactNode } from "react";
import { Header } from "@/components/Header";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <Header />
      {children}
    </>
  );
}
