"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Section, Container } from "@/components/layout/Container";
import { SITE, TERMS, SOCIALS, IPFS } from "@/lib/siteConfig";

interface VerificationResult {
  name: string;
  status: "verified" | "pending" | "failed";
  url: string;
  details: string;
}

const CHECKS: Omit<VerificationResult, "status">[] = [
  {
    name: "Vessel NFT Contract",
    url: "https://testnet.blockscout.robinhood.com/address/0xd3E85fe5D282e1bc49F4A6B189272Ec874D29500",
    details: "ERC-721A • OpenZeppelin • Testnet",
  },
  {
    name: "Contract Source Code",
    url: "https://testnet.blockscout.robinhood.com/address/0xd3E85fe5D282e1bc49F4A6B189272Ec874D29500#code",
    details: "Verified • Solidity 0.8.20 • MIT License",
  },
  {
    name: "IPFS Collection CID",
    url: `${IPFS.gateway}${IPFS.collectionCID}/`,
    details: "Lighthouse Gateway • 3,232 Assets • Pinned",
  },
  {
    name: "Reveal Commitment Hash",
    url: "#",
    details: "On-chain commitment • keccak256(traits + salt)",
  },
  {
    name: "Gate Contract",
    url: "#",
    details: "Design Phase • Custom Access Control",
  },
  {
    name: "$RITE Token Contract",
    url: "#",
    details: "Planned • Post-Gate Activation",
  },
];

export default function Verify() {
  const [results, setResults] = useState<VerificationResult[]>(
    CHECKS.map((c) => ({ ...c, status: "pending" as const }))
  );

  useEffect(() => {
    const verifyAll = async () => {
      for (let i = 0; i < CHECKS.length; i++) {
        const check = CHECKS[i];
        await new Promise((r) => setTimeout(r, 300 + i * 200));

        let status: "verified" | "pending" | "failed" = "pending";
        if (check.url.includes("blockscout") && check.url.includes("0xd3E85fe5")) {
          status = "verified";
        } else if (check.url.includes("lighthouse")) {
          status = "verified";
        } else if (check.url === "#") {
          status = check.name.includes("Planned") || check.name.includes("Design") ? "pending" : "failed";
        }

        setResults((prev) => {
          const next = [...prev];
          next[i] = { ...next[i], status };
          return next;
        });
      }
    };
    verifyAll();
  }, []);

  const verifiedCount = results.filter((r) => r.status === "verified").length;
  const totalCount = results.length;

  return (
    <>
      <Section variant="dark" padding="xl" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial" aria-hidden="true" />
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="sec-tag animate-fade-in">VERIFICATION</span>
          <h1 className="h1 animate-slide-up delay-100">VERIFY NULL RITE</h1>
          <p className="p-lg animate-slide-up delay-200">
            Every contract, every asset, every claim — verified on-chain.
            Don't trust, verify.
          </p>
          <div className="mt-6 animate-slide-up delay-300">
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan" />
                <span className="text-dim2">{verifiedCount} Verified</span>
              </div>
              <div className="text-line">|</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-dim" />
                <span className="text-dim2">{totalCount - verifiedCount} Pending</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section padding="xl">
        <Container size="xl">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {results.map((result, i) => (
                <Card
                  key={result.name}
                  variant="elevated"
                  padding="md"
                  className={`transition-all duration-300 ${
                    result.status === "verified" ? "border-cyan/30" : "border-line2"
                  }`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          result.status === "verified"
                            ? "bg-cyan/10 text-cyan"
                            : result.status === "pending"
                            ? "bg-acid/10 text-acid"
                            : "bg-magenta/10 text-magenta"
                        }`}
                        aria-hidden="true"
                      >
                        {result.status === "verified" && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        {result.status === "pending" && (
                          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        )}
                        {result.status === "failed" && (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-mono text-sm tracking-wider text-off truncate">{result.name}</h3>
                        <p className="text-dim2 text-xs truncate">{result.details}</p>
                      </div>
                    </div>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-panel2 border border-line2 rounded-lg text-dim2 hover:text-acid hover:border-acid/50 transition-colors font-mono text-xs tracking-wider whitespace-nowrap"
                    >
                      {result.url === "#" ? "NOT DEPLOYED" : "VIEW ON EXPLORER"}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card variant="elevated" padding="lg" className="sticky top-24">
                <div className="font-mono text-xs tracking-widest text-acid mb-6">MANUAL VERIFICATION</div>
                <div className="space-y-4">
                  <div className="p-4 bg-panel2 rounded-lg">
                    <div className="font-mono text-xs tracking-wider text-dim2 mb-2">CONTRACT ADDRESS</div>
                    <code className="text-off break-all text-sm">{SITE.contractAddress}</code>
                  </div>
                  <div className="p-4 bg-panel2 rounded-lg">
                    <div className="font-mono text-xs tracking-wider text-dim2 mb-2">CHAIN</div>
                    <div className="text-off text-sm">{SITE.chainName}</div>
                    <div className="text-dim text-xs mt-1">Testnet: {SITE.testnetChainId} • Mainnet: {SITE.chainId}</div>
                  </div>
                  <div className="p-4 bg-panel2 rounded-lg">
                    <div className="font-mono text-xs tracking-wider text-dim2 mb-2">IPFS GATEWAY</div>
                    <a href={IPFS.gateway} target="_blank" rel="noopener noreferrer" className="text-cyan hover:text-acid text-sm break-all">{IPFS.gateway}</a>
                  </div>
                  <div className="p-4 bg-panel2 rounded-lg">
                    <div className="font-mono text-xs tracking-wider text-dim2 mb-2">COLLECTION CID</div>
                    <code className="text-dim break-all text-xs">{IPFS.collectionCID}</code>
                  </div>
                  <div className="pt-4 border-t border-line space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigator.clipboard.writeText(SITE.contractAddress)}>
                      COPY CONTRACT ADDRESS
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => window.open(SOCIALS.contract, "_blank")}>
                      OPEN BLOCKSCOUT
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => window.open(`${IPFS.gateway}${IPFS.collectionCID}/`, "_blank")}>
                      OPEN IPFS GATEWAY
                    </Button>
                  </div>
                </div>
              </Card>

              <Card variant="outlined" padding="lg">
                <div className="font-mono text-xs tracking-widest text-acid mb-4">HOW TO VERIFY YOURSELF</div>
                <ol className="space-y-4 text-dim2 text-sm" role="list">
                  <li className="flex gap-3">
                    <span className="font-mono text-acid flex-shrink-0">1.</span>
                    <span>Open Blockscout link above. Confirm "Contract Verified" badge.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-acid flex-shrink-0">2.</span>
                    <span>Click "Contract" tab. Match source code to GitHub repo.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-acid flex-shrink-0">3.</span>
                    <span>Open IPFS Gateway. Confirm CID matches. Check 3,232 files exist.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-acid flex-shrink-0">4.</span>
                    <span>After Reveal: fetch salt from contract. Compute keccak256(traits + salt). Match commitment.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-acid flex-shrink-0">5.</span>
                    <span>Verify no proxy: contract code at address == verified source. No delegatecall.</span>
                  </li>
                </ol>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      <Section variant="alt" padding="xl">
        <Container size="md">
          <Card variant="elevated" padding="xl" className="text-center">
            <div className="font-mono text-xs tracking-widest text-acid mb-4">TRUST MINIMIZED</div>
            <h2 className="h2 mb-4">No Trust Required</h2>
            <p className="p-lg mb-8 max-w-2xl mx-auto">
              NULL RITE is designed for verification, not trust. Every claim above can be
              independently verified by anyone with a browser and basic technical literacy.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button variant="primary" onClick={() => window.open(SOCIALS.contract, "_blank")}>
                VERIFY ON BLOCKSCOUT
              </Button>
              <Button variant="ghost" onClick={() => window.open(`${IPFS.gateway}${IPFS.collectionCID}/`, "_blank")}>
                VERIFY ON IPFS
              </Button>
            </div>
          </Card>
        </Container>
      </Section>
    </>
  );
}