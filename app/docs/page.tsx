"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Section, Container } from "@/components/layout/Container";
import { SITE, TERMS, STATE, IPFS, SOCIALS } from "@/lib/siteConfig";

export default function Docs() {
  return (
    <>
      <Section variant="dark" padding="xl" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial" aria-hidden="true" />
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="sec-tag animate-fade-in">{TERMS.history}</span>
          <h1 className="h1 animate-slide-up delay-100">DOCUMENTATION</h1>
          <p className="p-lg animate-slide-up delay-200">
            Technical specifications, contract addresses, and protocol mechanics.
            All data verified on-chain.
          </p>
        </div>
      </Section>

      <Section padding="xl">
        <Container size="xl">
          <div className="grid lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1 space-y-6">
              <Card variant="elevated" padding="lg" className="sticky top-24">
                <div className="font-mono text-xs tracking-widest text-acid mb-6">QUICK LINKS</div>
                <nav className="space-y-3" aria-label="Documentation sections">
                  {[
                    { href: "#overview", label: "OVERVIEW" },
                    { href: "#contracts", label: "CONTRACTS" },
                    { href: "#minting", label: "MINTING SPECS" },
                    { href: "#reveal", label: "REVEAL MECHANIC" },
                    { href: "#gate", label: "GATE MECHANICS" },
                    { href: "#token", label: "$RITE TOKEN" },
                    { href: "#security", label: "SECURITY" },
                  ].map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="block text-dim2 hover:text-acid transition-colors font-mono text-sm tracking-wider"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
                <div className="mt-8 pt-8 border-t border-line">
                  <div className="font-mono text-xs tracking-widest text-acid mb-4">STATUS</div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-dim2">Network</span>
                      <span className="font-mono text-off">{SITE.chainName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dim2">Supply</span>
                      <span className="font-mono text-acid">{SITE.supply.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dim2">Reveal State</span>
                      <span className="font-mono text-dim">{STATE.reveal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dim2">Gate State</span>
                      <span className="font-mono text-dim">{STATE.gate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dim2">$RITE State</span>
                      <span className="font-mono text-dim">{STATE.rite}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </aside>

            <div className="lg:col-span-3 space-y-10">
              <section id="overview" className="space-y-6 animate-fade-in">
                <h2 className="h2 border-b border-line pb-3">PROTOCOL OVERVIEW</h2>
                <div className="prose text-dim2 max-w-none">
                  <p className="mb-4">
                    NULL RITE is a dark cosmic ritual encoded on Robinhood Chain.
                    The protocol consists of three core primitives:
                  </p>
                  <ul className="space-y-3 ml-6 list-disc">
                    <li><strong className="text-off">Vessel NFT (ERC-721A)</strong> — 3,232 unique identities. Minted via commitment scheme. Artwork sealed until The Reveal.</li>
                    <li><strong className="text-off">The Gate</strong> — On-chain access control gated by Vessel ownership + $RITE staking. No allowlists, no centralized control.</li>
                    <li><strong className="text-off">$RITE Token (ERC-20)</strong> — Native protocol token. Powers Gate passage, governance, and revenue share.</li>
                  </ul>
                  <p className="mt-4">
                    The Assembly (mint phase) must complete before The Reveal.
                    The Gate opens when Resonance threshold is reached.
                    $RITE token launches after Gate activation.
                  </p>
                </div>
              </section>

              <section id="contracts" className="space-y-6 animate-fade-in delay-100">
                <h2 className="h2 border-b border-line pb-3">CONTRACT ADDRESSES</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card variant="outlined" padding="lg">
                    <CardHeader>
                      <CardTitle>VESSEL NFT</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 font-mono text-sm">
                      <div className="flex justify-between">
                        <span className="text-dim2">Address</span>
                        <code className="text-off break-all">{SITE.contractAddress}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dim2">Chain</span>
                        <span className="text-off">{SITE.chainName} (Testnet: {SITE.testnetChainId})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dim2">Standard</span>
                        <span className="text-off">ERC-721A (OpenZeppelin)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dim2">Verification</span>
                        <a
                          href={SOCIALS.contract}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan hover:text-acid transition-colors"
                        >
                          Blockscout Verified
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                  <Card variant="outlined" padding="lg">
                    <CardHeader>
                      <CardTitle>$RITE TOKEN</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 font-mono text-sm">
                      <div className="flex justify-between">
                        <span className="text-dim2">Address</span>
                        <span className="text-dim">PENDING DEPLOYMENT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dim2">Chain</span>
                        <span className="text-off">{SITE.chainName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dim2">Standard</span>
                        <span className="text-off">ERC-20 (OpenZeppelin)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dim2">Launch</span>
                        <span className="text-dim">Post-Gate Activation</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card variant="outlined" padding="lg">
                    <CardHeader>
                      <CardTitle>GATE CONTRACT</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 font-mono text-sm">
                      <div className="flex justify-between">
                        <span className="text-dim2">Address</span>
                        <span className="text-dim">DESIGN PHASE</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dim2">Chain</span>
                        <span className="text-off">{SITE.chainName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dim2">Standard</span>
                        <span className="text-off">Custom ERC-20 Gated Access</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dim2">Audit</span>
                        <span className="text-dim">PLANNED</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card variant="outlined" padding="lg">
                    <CardHeader>
                      <CardTitle>REVEAL REGISTRY</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 font-mono text-sm">
                      <div className="flex justify-between">
                        <span className="text-dim2">Storage</span>
                        <span className="text-off">IPFS (Lighthouse)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dim2">Gateway</span>
                        <a href={IPFS.gateway} target="_blank" rel="noopener noreferrer" className="text-cyan hover:text-acid transition-colors text-sm">gateway.lighthouse.storage</a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dim2">CID</span>
                        <code className="text-dim break-all">{IPFS.collectionCID}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dim2">Verification</span>
                        <span className="text-off">Commitment Hash On-Chain</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section id="minting" className="space-y-6 animate-fade-in delay-200">
                <h2 className="h2 border-b border-line pb-3">MINTING SPECIFICATIONS</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card variant="elevated" padding="lg">
                    <CardHeader>
                      <CardTitle>PARAMETERS</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 font-mono text-sm">
                      <div className="flex justify-between"><span className="text-dim2">Total Supply</span><span className="text-acid text-xl">{SITE.supply.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-dim2">Max per Wallet</span><span className="text-off text-xl">{SITE.maxMintPerWallet}</span></div>
                      <div className="flex justify-between"><span className="text-dim2">Price</span><span className="text-off text-xl">{SITE.mintPriceEth} {SITE.mintCurrency}</span></div>
                      <div className="flex justify-between"><span className="text-dim2">Currency</span><span className="text-off">{SITE.mintCurrency}</span></div>
                      <div className="flex justify-between"><span className="text-dim2">Price Locked</span><span className={SITE.mintPriceLocked ? "text-acid" : "text-dim"}>{SITE.mintPriceLocked ? "YES" : "NO (PLACEHOLDER)"}</span></div>
                    </CardContent>
                  </Card>
                  <Card variant="elevated" padding="lg">
                    <CardHeader>
                      <CardTitle>MECHANICS</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-dim2">
                      <ul className="space-y-2" role="list">
                        <li className="flex items-start gap-2"><span className="text-acid">→</span> Public mint only — no whitelist, no presale</li>
                        <li className="flex items-start gap-2"><span className="text-acid">→</span> Commitment-based: traits determined on-chain at mint</li>
                        <li className="flex items-start gap-2"><span className="text-acid">→</span> Artwork sealed until Reveal event</li>
                        <li className="flex items-start gap-2"><span className="text-acid">→</span> ReentrancyGuard on mint function</li>
                        <li className="flex items-start gap-2"><span className="text-acid">→</span> No proxy, no upgradeability, no admin backdoors</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section id="reveal" className="space-y-6 animate-fade-in delay-300">
                <h2 className="h2 border-b border-line pb-3">REVEAL MECHANIC</h2>
                <Card variant="elevated" padding="lg">
                  <CardContent className="space-y-4 text-dim2">
                    <p>
                      NULL RITE uses a <strong className="text-off">cryptographic commitment scheme</strong>
                      for fair, decentralized reveal. No centralized reveal key. No single point of failure.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="p-4 bg-panel2 rounded-lg">
                        <div className="font-mono text-xs tracking-widest text-acid mb-2">1. COMMIT</div>
                        <p className="text-sm">At mint: keccak256(traits + salt) stored on-chain. Artwork uploaded to IPFS (encrypted).</p>
                      </div>
                      <div className="p-4 bg-panel2 rounded-lg">
                        <div className="font-mono text-xs tracking-widest text-acid mb-2">2. SEAL</div>
                        <p className="text-sm">Collection CID published. All metadata pinned. Gateway: {IPFS.gateway}</p>
                      </div>
                      <div className="p-4 bg-panel2 rounded-lg">
                        <div className="font-mono text-xs tracking-widest text-acid mb-2">3. REVEAL</div>
                        <p className="text-sm">Reveal event: salt published on-chain. Anyone can verify traits → artwork mapping.</p>
                      </div>
                    </div>
                    <div className="p-4 bg-panel2 rounded-lg border border-acid/30">
                      <div className="font-mono text-xs tracking-widest text-acid mb-2">VERIFICATION</div>
                      <p className="text-sm">
                        After reveal: <code className="font-mono">keccak256(revealedTraits + salt) == commitment</code>.
                        Run locally. No trust required.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section id="gate" className="space-y-6 animate-fade-in delay-400">
                <h2 className="h2 border-b border-line pb-3">GATE MECHANICS</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card variant="elevated" padding="lg">
                    <CardHeader>
                      <CardTitle>ACCESS REQUIREMENTS</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-dim2">
                      <ul className="space-y-2" role="list">
                        <li className="flex items-start gap-2"><span className="text-acid">✦</span> Minimum 1 Vessel NFT held</li>
                        <li className="flex items-start gap-2"><span className="text-acid">✦</span> Minimum $RITE staked (threshold TBD)</li>
                        <li className="flex items-start gap-2"><span className="text-acid">✦</span> Assembly phase complete</li>
                      </ul>
                      <div className="pt-4 border-t border-line">
                        <p className="text-sm">
                          Gate contract reads balances directly.
                          No signatures, no merkle proofs, no off-chain trust.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card variant="elevated" padding="lg">
                    <CardHeader>
                      <CardTitle>BENEFITS</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-dim2">
                      <ul className="space-y-2" role="list">
                        <li className="flex items-start gap-2"><span className="text-acid">✦</span> Permanent passage — no recurring fees</li>
                        <li className="flex items-start gap-2"><span className="text-acid">✦</span> Governance voting power</li>
                        <li className="flex items-start gap-2"><span className="text-acid">✦</span> Protocol revenue share</li>
                        <li className="flex items-start gap-2"><span className="text-acid">✦</span> Early access to future rites</li>
                        <li className="flex items-start gap-2"><span className="text-acid">✦</span> Exclusive token-gated channels</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section id="token" className="space-y-6 animate-fade-in delay-500">
                <h2 className="h2 border-b border-line pb-3">$RITE TOKENOMICS</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <Card variant="outlined" padding="md" className="text-center">
                    <div className="text-4xl font-bold text-acid font-mono">69%</div>
                    <div className="text-dim2 text-sm mt-1">Community & Rewards</div>
                  </Card>
                  <Card variant="outlined" padding="md" className="text-center">
                    <div className="text-4xl font-bold text-acid font-mono">21%</div>
                    <div className="text-dim2 text-sm mt-1">Treasury & Gate</div>
                  </Card>
                  <Card variant="outlined" padding="md" className="text-center">
                    <div className="text-4xl font-bold text-acid font-mono">10%</div>
                    <div className="text-dim2 text-sm mt-1">Team & Advisors</div>
                  </Card>
                </div>
                <Card variant="elevated" padding="lg">
                  <CardContent className="space-y-4 text-dim2">
                    <p>
                      $RITE launches <strong className="text-off">after Gate activation</strong>.
                      No pre-sale, no private round, no VCs.
                      Distribution via Gate passage rewards, liquidity mining, and community programs.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-mono text-sm tracking-widest text-acid mb-3">UTILITY</h4>
                        <ul className="space-y-2" role="list">
                          <li className="flex items-start gap-2"><span className="text-acid">→</span> Gate staking requirement</li>
                          <li className="flex items-start gap-2"><span className="text-acid">→</span> Governance voting</li>
                          <li className="flex items-start gap-2"><span className="text-acid">→</span> Revenue share (protocol fees)</li>
                          <li className="flex items-start gap-2"><span className="text-acid">→</span> Future Rite access</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-mono text-sm tracking-widest text-acid mb-3">DISTRIBUTION SCHEDULE</h4>
                        <ul className="space-y-2" role="list">
                          <li className="flex items-start gap-2"><span className="text-acid">→</span> TGE: 15% unlocked</li>
                          <li className="flex items-start gap-2"><span className="text-acid">→</span> Month 1-6: Linear vesting</li>
                          <li className="flex items-start gap-2"><span className="text-acid">→</span> Month 6-18: Monthly unlocks</li>
                          <li className="flex items-start gap-2"><span className="text-acid">→</span> Community: Ongoing emissions</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section id="security" className="space-y-6 animate-fade-in delay-600">
                <h2 className="h2 border-b border-line pb-3">SECURITY</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card variant="elevated" padding="lg">
                    <CardHeader>
                      <CardTitle>SMART CONTRACT</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-dim2">
                      <ul className="space-y-2" role="list">
                        <li className="flex items-start gap-2"><span className="text-cyan">✓</span> OpenZeppelin ERC-721A (battle-tested)</li>
                        <li className="flex items-start gap-2"><span className="text-cyan">✓</span> ReentrancyGuard on all external calls</li>
                        <li className="flex items-start gap-2"><span className="text-cyan">✓</span> No proxy pattern — immutable</li>
                        <li className="flex items-start gap-2"><span className="text-cyan">✓</span> No owner/admin functions post-deploy</li>
                        <li className="flex items-start gap-2"><span className="text-cyan">✓</span> Verified on Blockscout / Etherscan</li>
                        <li className="flex items-start gap-2"><span className="text-cyan">✓</span> 27/27 testnet acceptance tests passed</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card variant="elevated" padding="lg">
                    <CardHeader>
                      <CardTitle>AUDIT STATUS</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-dim2">
                      <div className="flex items-center gap-3 p-4 bg-panel2 rounded-lg">
                        <div className="w-3 h-3 rounded-full bg-dim" aria-hidden="true" />
                        <div>
                          <div className="font-mono text-sm text-off">Formal Audit</div>
                          <div className="text-xs text-dim">Planned post-testnet, pre-mainnet</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-panel2 rounded-lg">
                        <div className="w-3 h-3 rounded-full bg-cyan" aria-hidden="true" />
                        <div>
                          <div className="font-mono text-sm text-off">Testnet Acceptance</div>
                          <div className="text-xs text-dim">27/27 tests passed — all critical paths</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-panel2 rounded-lg">
                        <div className="w-3 h-3 rounded-full bg-cyan" aria-hidden="true" />
                        <div>
                          <div className="font-mono text-sm text-off">Static Analysis</div>
                          <div className="text-xs text-dim">Slither + Foundry fuzz — 0 critical</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}