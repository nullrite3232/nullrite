"use client";

import { SITE, STATE, TERMS, SOCIALS } from "@/lib/siteConfig";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Section } from "@/components/layout/Container";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Section variant="dark" padding="xl" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-conic opacity-50" aria-hidden="true" />
        
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="animate-fade-in">
            <span className="sec-tag">THE ASSEMBLY // PHASE I</span>
          </div>
          
          <h1 className="h1 animate-slide-up delay-100">
            3,232 VESSELS<br />
            <span className="text-acid">WILL ANSWER.</span>
          </h1>
          
          <p className="p-lg animate-slide-up delay-200 mx-auto">
            The Rite already exists. The Vessels are assembling. The Gate remains sealed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 animate-slide-up delay-300">
            <Link href="/mint">
              <Button size="lg" variant="primary" className="min-w-[200px]">
                BEGIN THE RITE
              </Button>
            </Link>
            <Link href="/collection">
              <Button size="lg" variant="ghost" className="min-w-[200px]">
                VIEW VESSELS
              </Button>
            </Link>
          </div>

          <div className="mt-16 animate-fade-in delay-400">
            <div className="flex flex-wrap items-center justify-center gap-6 text-dim2 text-sm font-mono tracking-wider">
              <span>SUPPLY: <span className="text-off font-bold">{SITE.supply.toLocaleString()}</span></span>
              <span className="text-line">|</span>
              <span>MAX/WALLET: <span className="text-off font-bold">{SITE.maxMintPerWallet}</span></span>
              <span className="text-line">|</span>
              <span>COST: <span className="text-off font-bold">{SITE.mintPriceEth} ETH</span></span>
              <span className="text-line">|</span>
              <span>CHAIN: <span className="text-off font-bold">{SITE.chainName}</span></span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
          <svg className="w-6 h-6 text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </Section>

      <Section padding="xl" className="bg-black2">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              icon: (
                <svg className="w-8 h-8 text-acid" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ),
              title: TERMS.mint,
              desc: "Summon your Vessel. Max 10 per wallet. The Assembly awaits your resonance.",
              href: "/mint",
              cta: "SUMMON NOW",
            },
            {
              icon: (
                <svg className="w-8 h-8 text-acid" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              ),
              title: TERMS.preReveal,
              desc: "3,232 Forms remain Sealed. Reveal follows the Assembly. Identity concealed until The Reveal.",
              href: "/collection",
              cta: "VIEW COLLECTION",
            },
            {
              icon: (
                <svg className="w-8 h-8 text-acid" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ),
              title: TERMS.gate,
              desc: "The Gate remains Sealed. Await the Resonance. $RITE stakers inherit passage.",
              href: "/gate",
              cta: "CHECK GATE",
            },
          ].map((item, i) => (
            <Link key={item.title} href={item.href} className="group">
              <Card variant="elevated" hover padding="lg" className="h-full flex flex-col">
                <div className="mb-4">{item.icon}</div>
                <h3 className="font-mono text-xl tracking-wider text-off mb-2 group-hover:text-acid transition-colors">
                  {item.title}
                </h3>
                <p className="text-dim2 flex-1 mb-6">{item.desc}</p>
                <Button variant="ghost" size="sm" className="w-full group-hover:text-acid group-hover:border-acid/50 transition-colors">
                  {item.cta} →
                </Button>
              </Card>
            </Link>
          ))}
        </div>
      </Section>

      <Section padding="xl">
        <div className="max-w-4xl mx-auto text-center">
          <span className="sec-tag">{TERMS.tokenVisual}</span>
          <h2 className="h2 mb-6">$RITE — THE RITE CORE</h2>
          <p className="p-lg mb-10">
            $RITE is the native token of NULL RITE. It powers The Gate — stakers earn passage,
            governance rights, and a share of the protocol's resonance. Tokenomics designed for
            long-term alignment, not short-term extraction.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            <Card variant="outlined" padding="md">
              <div className="text-3xl font-bold text-acid font-mono">69%</div>
              <div className="text-dim2 text-sm mt-1">Community & Rewards</div>
            </Card>
            <Card variant="outlined" padding="md">
              <div className="text-3xl font-bold text-acid font-mono">21%</div>
              <div className="text-dim2 text-sm mt-1">Treasury & Gate</div>
            </Card>
            <Card variant="outlined" padding="md">
              <div className="text-3xl font-bold text-acid font-mono">10%</div>
              <div className="text-dim2 text-sm mt-1">Team & Advisors</div>
            </Card>
          </div>
          <Link href="/docs">
            <Button variant="outline">READ TOKENOMICS</Button>
          </Link>
        </div>
      </Section>

      <Section variant="alt" padding="xl">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="sec-tag">SECURITY FIRST</span>
              <h2 className="h2 mb-4">Built to Endure</h2>
              <p className="p-lg">
                NULL RITE contracts are audited, tested, and verified. Every function is
                battle-tested on testnet before mainnet deployment. No proxies, no upgradeability
                backdoors, no hidden admin functions. What you see is what executes.
              </p>
              <ul className="space-y-3 mt-6" role="list">
                {[
                  "OpenZeppelin ERC-721A implementation",
                  "Commitment-based reveal (no centralized reveal)",
                  "ReentrancyGuard on all external calls",
                  "Verified on Blockscout / Etherscan",
                  "Testnet acceptance: 27/27 tests passed",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-dim2">
                    <svg className="w-5 h-5 text-acid flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Card variant="elevated" padding="lg" className="glow-acid">
              <div className="font-mono text-xs tracking-widest text-acid mb-4">CONTRACT STATUS</div>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-dim2">Vessel NFT</span>
                  <span className="text-acid font-mono">DEPLOYED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dim2">$RITE Token</span>
                  <span className="text-dim font-mono">PLANNED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dim2">Gate Contract</span>
                  <span className="text-dim font-mono">DESIGN PHASE</span>
                </div>
                <div className="flex justify-between border-t border-line pt-4">
                  <span className="text-dim2">Audit</span>
                  <span className="text-cyan font-mono">PENDING</span>
                </div>
              </div>
              <Link href="/verify" className="block mt-6 text-center">
                <Button variant="outline" className="w-full">VERIFY ADDRESSES</Button>
              </Link>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}