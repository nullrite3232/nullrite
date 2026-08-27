"use client";

/**
 * NULL RITE route pages for the current sealed launch-facing experience.
 * RouteRouter controls visibility via hash navigation.
 */
export function RoutePages() {
  return (
    <>
      {/* COLLECTION */}
      <section className="route-page" id="collectionPage" aria-hidden="true">
        <div className="route-inner">
          <div className="route-topline">
            <div className="route-code">NULL RITE // COLLECTION // PRE-REVEAL</div>
            <button className="route-back" data-close-page>
              ← Return Home
            </button>
          </div>

          <div className="collection-head">
            <div>
              <div className="eyebrow">THE VESSELS</div>
              <h1 className="route-title">
                3,232 FORMS
                <br />
                REMAIN SEALED.
              </h1>
              <p className="route-sub">
                This is the collection state before reveal. Ownership may exist,
                but born identity, rarity and traits remain withheld until the
                Reveal is activated.
              </p>
            </div>
            <div className="collection-state">
              <div className="ritual-row">
                <span>Total Supply</span>
                <span>3,232</span>
              </div>
              <div className="ritual-row">
                <span>Reveal State</span>
                <span>SEALED</span>
              </div>
              <div className="ritual-row">
                <span>Network</span>
                <span>ROBINHOOD CHAIN</span>
              </div>
              <div className="ritual-row">
                <span>Artwork</span>
                <span>WITHHELD</span>
              </div>
            </div>
          </div>

          <div className="sealed-grid" id="sealedCollectionGrid" />
        </div>
      </section>

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
              <div className="eyebrow">GATE_STATE // SEALED</div>
              <h2>
                THE GATE
                <br />
                REMAINS SEALED.
              </h2>
              <p>
                This page is reserved for the Gate experience. It has not opened
                yet. When the next phase begins, the live Gate interface can
                replace this sealed state without changing the rest of the site.
              </p>

              <div className="gate-lock">
                <div>
                  <strong>SEALED</strong>
                  <span>Current State</span>
                </div>
                <div>
                  <strong>COMING SOON</strong>
                  <span>Entry Status</span>
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
              <a href="#docs-gate">The Gate</a>
            </aside>

            <div className="docs-content">
              <article id="docs-overview">
                <div className="docs-status">
                  <i></i>Project Overview
                </div>
                <h2>NULL RITE</h2>
                <p>
                  NULL RITE is a collection of 3,232 Vessels on Robinhood Chain.
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
                    <span>3,232 VESSELS</span>
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
                    <span>10 / WALLET</span>
                  </div>
                  <div className="ritual-row">
                    <span>Per Summoning</span>
                    <span>1–5 VESSELS</span>
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
                  The Summoning is the mint experience. The current interface
                  supports 1 to 5 Vessels per transaction, while the collection
                  policy allows up to 10 Vessels per wallet.
                </p>
                <p>
                  After the wallet signs, the interface waits for chain
                  confirmation automatically. A successful mint means a Vessel
                  has answered; it does not reveal the final form immediately.
                </p>
                <div className="docs-spec">
                  <div className="ritual-row">
                    <span>Per Transaction</span>
                    <span>1–5</span>
                  </div>
                  <div className="ritual-row">
                    <span>Per Wallet</span>
                    <span>10 MAX</span>
                  </div>
                  <div className="ritual-row">
                    <span>Success State</span>
                    <span>VESSEL ANSWERED</span>
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
                  Reveal exposes the Vessel&apos;s born identity. It does not open
                  the Gate; the Gate remains a separate phase that begins later.
                </p>
              </article>

              <article id="docs-gate">
                <div className="docs-status">
                  <i></i>Future Layer
                </div>
                <h2>THE GATE</h2>
                <p>
                  The Gate is intentionally sealed in V1. Its dedicated page
                  exists now so users can see the destination without exposing
                  unfinished mechanics.
                </p>
                <p>
                  When the Gate opens, a Vessel can make irreversible choices
                  that become part of its persistent Record and influence what
                  future Gates show it.
                </p>
                <div className="docs-spec">
                  <div className="ritual-row">
                    <span>Current State</span>
                    <span>SEALED</span>
                  </div>
                  <div className="ritual-row">
                    <span>Entry</span>
                    <span>COMING SOON</span>
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
