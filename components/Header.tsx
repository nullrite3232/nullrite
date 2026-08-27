"use client";

import { useState } from "react";
import { WalletButton } from "@/components/WalletButton";

const NAV = [
  { key: "home", label: "Home", href: "#top" },
  { key: "mint", label: "Summoning", href: "#summoning" },
  { key: "collection", label: "Collection", href: "#collection" },
  { key: "gate", label: "Gate", href: "#gate" },
  { key: "docs", label: "Docs", href: "#docs" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header>
      <a href="#top" className="wordmark" onClick={() => setMenuOpen(false)}>
        NULL RITE
      </a>

      <nav className={`main-nav ${menuOpen ? "mobile-open" : ""}`}>
        {NAV.map((n) => (
          <a
            key={n.key}
            href={n.href}
            data-nav={n.key}
            onClick={() => setMenuOpen(false)}
          >
            {n.label}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <WalletButton />
        <button
          className={`nav-toggle ${menuOpen ? "open" : ""}`}
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
