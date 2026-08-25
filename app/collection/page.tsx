"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Section, Container } from "@/components/layout/Container";
import { SITE, TERMS, IPFS } from "@/lib/siteConfig";
import Link from "next/link";

interface Vessel {
  id: number;
  name: string;
  image: string;
  isRevealed: boolean;
}

const VESSELS_PER_PAGE = 48;

export default function Collection() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    generateVessels();
  }, []);

  const generateVessels = () => {
    const list: Vessel[] = [];
    const total = SITE.supply;
    const revealed = Math.floor(total * 0.3);

    for (let i = 1; i <= total; i++) {
      const isRev = i <= revealed;
      list.push({
        id: i,
        name: isRev ? `Vessel #${i}` : "SEALED VESSEL",
        image: isRev
          ? `${IPFS.gateway}${IPFS.collectionCID}/Vessel_${String(i).padStart(4, "0")}.png`
          : "/sealed-vessel.png",
        isRevealed: isRev,
      });
    }
    setVessels(list);
    setRevealedCount(revealed);
    setIsLoading(false);
  };

  const totalPages = Math.ceil(vessels.length / VESSELS_PER_PAGE);
  const paginatedVessels = vessels.slice(
    (currentPage - 1) * VESSELS_PER_PAGE,
    currentPage * VESSELS_PER_PAGE
  );

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/sealed-vessel.png";
  };

  return (
    <>
      <Section variant="dark" padding="xl" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial" aria-hidden="true" />
        <div className="relative max-w-5xl mx-auto text-center">
          <span className="sec-tag animate-fade-in">{TERMS.preReveal}</span>
          <h1 className="h1 animate-slide-up delay-100">
            THE <span className="text-acid">ASSEMBLY</span>
          </h1>
          <p className="p-lg animate-slide-up delay-200">
            {SITE.supply.toLocaleString()} Vessels forged. {revealedCount.toLocaleString()} Revealed.
            {SITE.supply - revealedCount} remain Sealed.
          </p>
        </div>
      </Section>

      <Section padding="xl">
        <Container size="xl">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-dim2 font-mono text-sm">
                Showing <span className="text-off">{(currentPage - 1) * VESSELS_PER_PAGE + 1}</span>–<span className="text-off">{Math.min(currentPage * VESSELS_PER_PAGE, vessels.length)}</span> of <span className="text-acid">{vessels.length.toLocaleString()}</span>
              </span>
              <div className="flex items-center gap-2 border border-line2 rounded-lg px-3 py-1">
                <svg className="w-4 h-4 text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 13a2.121 2.121 0 00-3-3L9.414 10.586a1.121 1.121 0 000 1.586l2.587 2.586a1.121 1.121 0 001.586 0l3.293-3.293a2.121 2.121 0 000-3z" />
                </svg>
                <select
                  className="bg-transparent border-none text-off font-mono text-sm outline-none w-auto"
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  aria-label="Page"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <option key={p} value={p}>
                      Page {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/mint">
                <Button variant="primary" size="sm">SUMMON VESSEL</Button>
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 24 }).map((_, i) => (
                <Card key={i} variant="elevated" className="aspect-square animate-pulse">
                  <div className="w-full h-full bg-panel2 rounded-t-lg" />
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                role="list"
                aria-label="Vessel collection"
              >
                {paginatedVessels.map((vessel) => (
                  <article
                    key={vessel.id}
                    className="group relative"
                    role="listitem"
                  >
                    <Card variant="elevated" className="aspect-square overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_var(--acid)/10]">
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={vessel.image}
                          alt={vessel.isRevealed ? `Vessel #${vessel.id} artwork` : "Sealed Vessel"}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
                          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
                            vessel.isRevealed ? "" : "grayscale"
                          }`}
                          onError={handleImageError}
                          loading="lazy"
                        />
                        {!vessel.isRevealed && (
                          <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/50 to-transparent flex items-end p-4">
                            <div className="w-full text-center">
                              <span className="font-mono text-xs tracking-widest text-dim2">
                                SEALED
                              </span>
                              <div className="text-2xl font-bold text-dim mt-1">#{String(vessel.id).padStart(4, "0")}</div>
                            </div>
                          </div>
                        )}
                        {vessel.isRevealed && (
                          <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <div className="w-full text-center">
                              <span className="font-mono text-xs tracking-widest text-acid">
                                REVEALED
                              </span>
                              <div className="text-2xl font-bold text-off mt-1">#{String(vessel.id).padStart(4, "0")}</div>
                            </div>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3 space-y-1">
                        <div className="font-mono text-sm text-off text-center">
                          {vessel.name}
                        </div>
                        <div className="flex items-center justify-center gap-1 text-xs">
                          <span className={`px-1.5 py-0.5 rounded font-mono ${
                            vessel.isRevealed
                              ? "bg-acid/10 text-acid border border-acid/30"
                              : "bg-dim/10 text-dim border border-line2"
                          }`}>
                            {vessel.isRevealed ? "REVEALED" : "SEALED"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </article>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 7) {
                        pageNum = i + 1;
                      } else if (currentPage <= 4) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        pageNum = totalPages - 6 + i;
                      } else {
                        pageNum = currentPage - 3 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-mono text-sm transition-colors ${
                            currentPage === pageNum
                              ? "bg-acid text-bg"
                              : "bg-panel2 text-dim2 hover:text-off hover:bg-line"
                          }`}
                          aria-label={`Page ${pageNum}`}
                          aria-current={currentPage === pageNum ? "page" : undefined}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              )}
            </>
          )}
        </Container>
      </Section>

      <Section variant="alt" padding="xl">
        <Container size="md">
          <Card variant="elevated" padding="lg">
            <div className="text-center">
              <span className="sec-tag">THE REVEAL MECHANIC</span>
              <h2 className="h2 mb-4">Commitment-Based Reveal</h2>
              <p className="p-lg mb-8 max-w-2xl mx-auto">
                NULL RITE uses a cryptographic commitment scheme. Each Vessel's traits are determined
                on-chain at mint time, but artwork remains sealed until The Reveal event.
                No centralized reveal — no single point of failure.
              </p>
              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="text-center p-4">
                  <div className="text-4xl font-bold text-acid font-mono mb-2">1</div>
                  <div className="font-mono text-sm text-off mb-1">MINT</div>
                  <div className="text-dim2 text-sm">Commit to the Rite. Traits determined on-chain.</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-4xl font-bold text-acid font-mono mb-2">2</div>
                  <div className="font-mono text-sm text-off mb-1">SEAL</div>
                  <div className="text-dim2 text-sm">Artwork encrypted. Identity concealed.</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-4xl font-bold text-acid font-mono mb-2">3</div>
                  <div className="font-mono text-sm text-off mb-1">REVEAL</div>
                  <div className="text-dim2 text-sm">Commitment opened. True form manifested.</div>
                </div>
              </div>
            </div>
          </Card>
        </Container>
      </Section>
    </>
  );
}