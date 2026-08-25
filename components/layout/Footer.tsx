"use client";

import Link from "next/link";
import { SITE, SOCIALS, TERMS } from "@/lib/siteConfig";
import { Container } from "./Container";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="border-t border-line bg-black2"
      role="contentinfo"
    >
      <Container className="py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 wordmark mb-6">
              <span className="font-mono tracking-widest text-sm text-acid">
                NULL
              </span>
              <span className="font-mono tracking-widest text-sm text-off">
                <b>RITE</b>
              </span>
            </div>
            <p className="text-dim2 max-w-xs leading-relaxed mb-6">
              {SITE.supply} Vessels. One Gate. The Rite awaits.
            </p>
            <div className="flex flex-wrap gap-3">
              {SOCIALS.x && (
                <a
                  href={SOCIALS.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-dim hover:text-acid transition-colors font-mono text-xs tracking-wider"
                >
                  X / Twitter
                </a>
              )}
              {SOCIALS.discord && (
                <a
                  href={SOCIALS.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-dim hover:text-acid transition-colors font-mono text-xs tracking-wider"
                >
                  Discord
                </a>
              )}
              <a
                href="/verify"
                className="text-dim hover:text-acid transition-colors font-mono text-xs tracking-wider"
              >
                Verify
              </a>
              <a
                href="/docs"
                className="text-dim hover:text-acid transition-colors font-mono text-xs tracking-wider"
              >
                {TERMS.history}
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-mono text-xs tracking-widest text-acid mb-4">
              THE RITE
            </h4>
            <nav className="space-y-2" aria-label="The Rite links">
              <Link
                href="/mint"
                className="block text-dim hover:text-off transition-colors text-sm"
              >
                {TERMS.mintCta}
              </Link>
              <Link
                href="/collection"
                className="block text-dim hover:text-off transition-colors text-sm"
              >
                {TERMS.preReveal}
              </Link>
              <Link
                href="/gate"
                className="block text-dim hover:text-off transition-colors text-sm"
              >
                {TERMS.gate}
              </Link>
              <Link
                href="#rite"
                className="block text-dim hover:text-off transition-colors text-sm"
              >
                {TERMS.tokenVisual}
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="font-mono text-xs tracking-widest text-acid mb-4">
              SPECS
            </h4>
            <nav className="space-y-2" aria-label="Technical specifications">
              <Link
                href="/docs"
                className="block text-dim hover:text-off transition-colors text-sm"
              >
                Documentation
              </Link>
              <Link
                href="/verify"
                className="block text-dim hover:text-off transition-colors text-sm"
              >
                Contract Addresses
              </Link>
              <a
                href="#"
                className="block text-dim hover:text-off transition-colors text-sm"
              >
                Audit Report
              </a>
              <a
                href="#"
                className="block text-dim hover:text-off transition-colors text-sm"
              >
                Tokenomics
              </a>
            </nav>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-line flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs tracking-wider text-dim">
            © {currentYear} {SITE.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-dim2">
            <span>Chain: {SITE.chainName}</span>
            <span>Supply: {SITE.supply.toLocaleString()}</span>
            <span>Max/Wallet: {SITE.maxMintPerWallet}</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}