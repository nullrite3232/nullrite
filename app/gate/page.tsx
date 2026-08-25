"use client";

import { useAccount, useChainId } from "wagmi";
import { RH_TESTNET_CHAIN } from "@/lib/chain";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Section, Container } from "@/components/layout/Container";
import { SITE, TERMS } from "@/lib/siteConfig";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export default function Gate() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isWrongChain = chainId !== 46630;

  const hasVessel = false;
  const hasRite = false;
  const isGateOpen = false;

  return (
    <>
      <Section variant="dark" padding="xl" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial" aria-hidden="true" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-acid/5 blur-[200px]" aria-hidden="true" />
        <div className="relative max-w-3xl mx-auto text-center">
          <span className="sec-tag animate-fade-in">{TERMS.gate}</span>
          <h1 className="h1 animate-slide-up delay-100">
            THE GATE<br />
            <span className="text-dim">REMAINS SEALED</span>
          </h1>
          <p className="p-lg animate-slide-up delay-200">
            Passage is earned, not given. The Gate opens only to those who have answered the Rite.
          </p>
        </div>
      </Section>

      <Section padding="xl">
        <Container size="md">
          <Card variant="elevated" padding="xl" className="text-center relative overflow-hidden glow-acid">
            <div className="absolute inset-0 bg-gradient-conic opacity-5" aria-hidden="true" />
            <div className="relative">
              <div className="w-32 h-32 mx-auto mb-8 relative">
                <div className="absolute inset-0 rounded-full border-4 border-acid/20" />
                <div className={`absolute inset-0 rounded-full border-4 border-acid transition-all duration-1000 ${isGateOpen ? "rotate-[360deg]" : ""}`} style={{ clipPath: "polygon(50% 50%, 100% 0, 100% 50%, 50% 50%)" }} aria-hidden="true" />
                <div className="relative w-full h-full rounded-full bg-panel2 flex items-center justify-center">
                  <svg className={`w-16 h-16 text-acid transition-transform duration-500 ${isGateOpen ? "rotate-90 scale-110" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>

              <h2 className="h2 mb-2">
                {isGateOpen ? "THE GATE IS OPEN" : "THE GATE IS SEALED"}
              </h2>
              <p className="p-lg mb-8 max-w-md mx-auto">
                {isGateOpen
                  ? "You have answered the Rite. Passage granted. Welcome beyond."
                  : "The Gate awaits the Resonance. Complete the Assembly to unlock passage."}
              </p>

              <div className="grid sm:grid-cols-3 gap-4 mb-8 max-w-xl mx-auto">
                <div className={`p-4 rounded-lg bg-panel2 border ${hasVessel ? "border-acid/50" : "border-line2"}`}>
                  <div className="font-mono text-xs tracking-widest text-acid mb-1">VESSEL</div>
                  <div className="text-2xl font-bold text-off">{hasVessel ? "HELD" : "NONE"}</div>
                </div>
                <div className={`p-4 rounded-lg bg-panel2 border ${hasRite ? "border-acid/50" : "border-line2"}`}>
                  <div className="font-mono text-xs tracking-widest text-acid mb-1">$RITE STAKED</div>
                  <div className="text-2xl font-bold text-off">{hasRite ? "ACTIVE" : "NONE"}</div>
                </div>
                <div className={`p-4 rounded-lg bg-panel2 border ${isGateOpen ? "border-acid/50" : "border-line2"}`}>
                  <div className="font-mono text-xs tracking-widest text-acid mb-1">GATE STATUS</div>
                  <div className="text-2xl font-bold text-off">{isGateOpen ? "OPEN" : "SEALED"}</div>
                </div>
              </div>

              {(!isConnected || isWrongChain) && (
                <div className="space-y-4">
                  {!isConnected && (
                    <div className="w-full max-w-xs mx-auto">
                      <p className="text-dim2 text-sm text-center mb-3">Connect wallet to check eligibility</p>
                      <ConnectButton showBalance={false} />
                    </div>
                  )}
                  {isConnected && isWrongChain && (
                    <Button variant="primary" className="w-full max-w-xs mx-auto" onClick={() => window.location.reload()}>
                      SWITCH TO {RH_TESTNET_CHAIN.name.toUpperCase()}
                    </Button>
                  )}
                </div>
              )}

              {isConnected && !isWrongChain && !isGateOpen && (
                <div className="space-y-4 text-dim2 text-sm">
                  <p>Requirements for Gate passage:</p>
                  <ul className="space-y-2 text-left max-w-md mx-auto">
                    <li className="flex items-center gap-2"><span className="text-dim">✦</span> Hold at least 1 Vessel NFT</li>
                    <li className="flex items-center gap-2"><span className="text-dim">✦</span> Stake $RITE tokens</li>
                    <li className="flex items-center gap-2"><span className="text-dim">✦</span> Complete Assembly phase</li>
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                    <Link href="/mint"><Button variant="primary">SUMMON VESSEL</Button></Link>
                    <Link href="/docs"><Button variant="ghost">READ GATE SPECS</Button></Link>
                  </div>
                </div>
              )}

              {isGateOpen && (
                <Button variant="primary" size="lg" className="w-full max-w-xs mx-auto" onClick={() => window.open("https://nullrite.xyz/gate", "_blank")}>
                  ENTER THE GATE →
                </Button>
              )}
            </div>
          </Card>
        </Container>
      </Section>

      <Section variant="alt" padding="xl">
        <Container size="xl">
          <div className="text-center mb-12">
            <span className="sec-tag">GATE MECHANICS</span>
            <h2 className="h2 mb-4">How Passage Works</h2>
            <p className="p-lg max-w-2xl mx-auto">
              The Gate is a smart contract gated by Vessel ownership and $RITE staking.
              No allowlists, no centralized control — pure on-chain verification.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-8 h-8 text-acid" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "ON-CHAIN VERIFICATION",
                desc: "Gate contract reads Vessel balance and $RITE stake directly. No signatures, no off-chain trust.",
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-acid" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "DYNAMIC THRESHOLDS",
                desc: "Requirements adjust based on Assembly progress. Early adopters benefit from lower thresholds.",
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-acid" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: "PERMANENT PASSAGE",
                desc: "Once granted, passage is permanent. Vessel + stake = lifetime Gate access. No recurring fees.",
              },
            ].map((item, i) => (
              <Card key={i} variant="elevated" padding="lg" className="text-center hover:border-acid/30 transition-colors">
                <div className="mb-4">{item.icon}</div>
                <h3 className="font-mono text-lg tracking-wider text-off mb-2">{item.title}</h3>
                <p className="text-dim2">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}