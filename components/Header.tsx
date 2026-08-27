"use client";

import { WalletButton } from "@/components/WalletButton";

const NAV = [
  { key: "home", label: "Home", href: "#top" },
  { key: "mint", label: "Mint", href: "#mint" },
  { key: "collection", label: "Collection", href: "#collection" },
  { key: "gate", label: "Gate", href: "#gate" },
  { key: "docs", label: "Docs", href: "#docs" },
];

/**
 * v15 EXACT header — hash links with data-nav; RouteRouter intercepts clicks.
 */
export function Header() {
  return (
    <header>
      <a href="#top" className="wordmark">
        NULL RITE
      </a>
      <nav className="main-nav">
        {NAV.map((n) => (
          <a key={n.key} href={n.href} data-nav={n.key}>
            {n.label}
          </a>
        ))}
      </nav>
      <WalletButton />
    </header>
  );
}
