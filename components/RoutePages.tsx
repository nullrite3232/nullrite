"use client";

import { CollectionPage } from "@/components/CollectionPage";

/**
 * NULL RITE route pages for the current sealed launch-facing experience.
 * RouteRouter controls visibility via hash navigation.
 */
export function RoutePages() {
  return (
    <>
      <CollectionPage />

      {/* GATE */}
      <section className="route-page" id="gatePage" aria-hidden="true">
        <div className="gate-page-inner">
          <div className="gate-page-stage">
            <video
              id="gatePageVideo"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
            <div className="gate-page-copy">
              <div className="eyebrow">GATE_STATE // SEALED // NEXT: RESONANCE</div>
              <h2>
                THE GATE
                <br />
                REMAINS SEALED.
              </h2>
              <p>
                The Gate is where a Vessel begins to accumulate permanent history.
                When Resonance begins, Vessels will face paths and conditions that
                can change according to what their Record already contains.
              </p>

              <div className="gate-protocol-grid" aria-label="Sealed Gate protocol preview">
                <div className="gate-protocol-cell">
                  <span>Decisions</span>
                  <strong>IRREVERSIBLE</strong>
                </div>
                <div className="gate-protocol-cell">
                  <span>Offerings</span>
                  <strong className="burn">$RITE // BURNED</strong>
                </div>
                <div className="gate-protocol-cell">
                  <span>Completion</span>
                  <strong>REQUIRED</strong>
                </div>
                <div className="gate-protocol-cell">
                  <span>Resonance</span>
                  <strong className="resonance">POOL ELIGIBILITY</strong>
                </div>
              </div>

              <p className="gate-protocol-note">
                Exact paths, hidden conditions and outcomes remain undisclosed until a Gate opens.
                Each Gate publishes its Offering, Pool and completion rules before participation begins.
              </p>

              <div className="gate-lock">
                <div>
                  <strong>SEALED</strong>
                  <span>Current State</span>
                </div>
                <div>
                  <strong>RESONANCE</strong>
                  <span>Next State</span>
                </div>
              </div>

              <div className="coming-mark">
                <i></i>
                <span>Awaiting Resonance</span>
              </div>

              <div className="actions" style={{ justifyContent: "center", marginTop: 28 }}>
                <button className="btn" data-close-page>
                  Return Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DOCS */}
      <section className="route-page" id="docsPage" aria-hidden="true">
        <div className="route-inner">
          <div className="route-topline">
            <div className="route-code">NULL RITE // DOCUMENTATION // V1</div>
            <button className="route-back" data-close-page>
              ← Return Home
            </button>
          </div>

          <div className="docs-layout">
            <aside className="docs-index">
              <a href="#docs-overview">Overview</a>
              <a href="#docs-rite">$RITE</a>
              <a href="#docs-vessels">Vessels</a>
              <a href="#docs-summoning">Summoning</a>
              <a href="#docs-reveal">Reveal</a>
              <a href="#docs-fair-reveal">Fair Reveal</a>
              <a href="#docs-gate">The Gate</a>
            </aside>

            <div className="docs-content">
              <article id="docs-overview">
                <div className="docs-status">
                  <i></i>Project Overview
                </div>
                <h2>NULL RITE</h2>
                <p>
                  NULL RITE is a collection of 3232 Vessels on Robinhood Chain.
                  The launch unfolds as a sequence: $RITE awakens, Vessels are
                  summoned, identities are revealed, and only then does the Gate
                  begin to write persistent history.
                </p>
                <p className="docs-note">
                  V1 documentation describes the launch-facing website. The Gate
                  remains sealed until the next phase is opened.
                </p>
                <div className="docs-spec">
                  <div className="ritual-row">
                    <span>Collection</span>
                    <span>3232 VESSELS</span>
                  </div>
                  <div className="ritual-row">
                    <span>Network</span>
                    <span>ROBINHOOD CHAIN</span>
                  </div>
                  <div className="ritual-row">
                    <span>Mint Currency</span>
                    <span>ETH</span>
                  </div>
                  <div className="ritual-row">
                    <span>Wallet Limit</span>
                    <span>READ ONCHAIN</span>
                  </div>
                  <div className="ritual-row">
                    <span>Per Summoning</span>
                    <span>READ ONCHAIN</span>
                  </div>
                </div>
              </article>

              <article id="docs-rite">
                <div className="docs-status">
                  <i></i>Launch Layer // Sealed
                </div>
                <h2>$RITE</h2>
                <p>
                  $RITE precedes the Vessel Summoning in the NULL RITE launch
                  sequence. It is the ritual fuel: the means to participate in
                  eligibility, Offerings, irreversible decisions and future Gate
                  access.
                </p>
                <p>
                  A Vessel is the identity that walks the path. $RITE is not that
                  identity; it is the means to act. Its live token action remains
                  sealed until the launch layer opens.
                </p>
              </article>

              <article id="docs-vessels">
                <div className="docs-status">
                  <i></i>Collection
                </div>
                <h2>VESSELS</h2>
                <p>
                  VESSELS are the NFT identities of NULL RITE. During the
                  pre-reveal phase their final artwork, traits and rarity remain
                  sealed.
                </p>
                <p>
                  After Reveal, each Vessel exposes its born identity. Later Gate
                  history remains a separate layer so the original artwork and
                  born traits do not need to be overwritten.
                </p>
              </article>

              <article id="docs-summoning">
                <div className="docs-status">
                  <i></i>Mint
                </div>
                <h2>THE SUMMONING</h2>
                <p>
                  The Summoning is the mint experience. Price, public mint state,
                  per-transaction limit and per-wallet limit are read directly
                  from the Vessel contract by the live interface.
                </p>
                <p>
                  After the wallet signs, the interface waits for chain
                  confirmation automatically. A successful mint means a Vessel
                  has answered; it does not reveal the final form immediately.
                </p>
                <div className="docs-spec">
                  <div className="ritual-row">
                    <span>Mint Price</span>
                    <span>LIVE CONTRACT STATE</span>
                  </div>
                  <div className="ritual-row">
                    <span>Per Transaction</span>
                    <span>LIVE CONTRACT STATE</span>
                  </div>
                  <div className="ritual-row">
                    <span>Per Wallet</span>
                    <span>LIVE CONTRACT STATE</span>
                  </div>
                  <div className="ritual-row">
                    <span>Identity State</span>
                    <span>SEALED</span>
                  </div>
                </div>
              </article>

              <article id="docs-reveal">
                <div className="docs-status">
                  <i></i>Post-Mint
                </div>
                <h2>THE REVEAL</h2>
                <p>
                  Mint and Reveal are separate moments. Before Reveal, the
                  Collection page uses the sealed state. When Reveal is activated,
                  that page can display actual Vessel artwork, rarity and traits.
                </p>
                <p>
                  Token IDs remain sequential. The final artwork, traits and rarity
                  assignment are randomized at Reveal, so mint order does not
                  determine the final form a Vessel receives.
                </p>
              </article>

              <article id="docs-fair-reveal">
                <div className="docs-status">
                  <i></i>Verifiable Assignment
                </div>
                <h2>FAIR REVEAL</h2>
                <p>
                  Before the Reveal seed is known, the complete reveal set will be
                  committed through a published provenance hash. That commitment
                  fixes the underlying set before final assignment occurs.
                </p>
                <p>
                  The final assignment will use a pre-declared onchain seed source
                  after the provenance commitment exists. The commitment, seed and
                  resulting assignment method will be published so the reveal can
                  be independently verified.
                </p>
                <div className="docs-proof">
                  <strong>THE ORDER CANNOT REARRANGE WHAT HAS ALREADY BEEN COMMITTED.</strong>
                  <p>
                    Provenance fixes the set first. The later seed determines how
                    that committed set maps to sequential Vessel IDs.
                  </p>
                </div>
                <div className="docs-spec">
                  <div className="ritual-row">
                    <span>Token IDs</span>
                    <span>SEQUENTIAL</span>
                  </div>
                  <div className="ritual-row">
                    <span>Artwork Assignment</span>
                    <span>RANDOMIZED AT REVEAL</span>
                  </div>
                  <div className="ritual-row">
                    <span>Provenance</span>
                    <span>PUBLISHED BEFORE SEED</span>
                  </div>
                  <div className="ritual-row">
                    <span>Verification</span>
                    <span>PUBLIC</span>
                  </div>
                </div>
              </article>

              <article id="docs-gate">
                <div className="docs-status">
                  <i></i>Future Layer
                </div>
                <h2>THE GATE</h2>
                <p>
                  The Gate remains sealed until Resonance. When it opens, a Vessel
                  can make irreversible choices that become part of its persistent
                  Record and influence what future Gates show it.
                </p>
                <p>
                  Certain Gate actions can require an Offering in $RITE. Accepted
                  Offerings are burned. Completing a Gate can earn eligibility for
                  that Gate&apos;s disclosed Resonance Pool; exact requirements and
                  Pool contents are published per Gate before participation begins.
                </p>
                <div className="docs-spec">
                  <div className="ritual-row">
                    <span>Current State</span>
                    <span>SEALED</span>
                  </div>
                  <div className="ritual-row">
                    <span>Next State</span>
                    <span>RESONANCE</span>
                  </div>
                  <div className="ritual-row">
                    <span>Decisions</span>
                    <span>IRREVERSIBLE</span>
                  </div>
                  <div className="ritual-row">
                    <span>Completion</span>
                    <span>RESONANCE ELIGIBILITY</span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
