"use client";

/**
 * v15 EXACT port — the three distinct route pages (Collection / Gate / Docs).
 * They live hidden in the DOM; RouteRouter toggles .active / aria-hidden.
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
              <a href="#docs-vessels">Vessels</a>
              <a href="#docs-summoning">Summoning</a>
              <a href="#docs-reveal">Reveal</a>
              <a href="#docs-rite">$RITE</a>
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
                  A Vessel begins as an identity. Later phases are designed to
                  let that identity carry a persistent history through the Gate.
                </p>
                <p className="docs-note">
                  V1 documentation describes the launch-facing website only.
                  Live Gate mechanics and later phases can be added when the
                  frontend and backend are ready.
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
                    <span>Max Mint</span>
                    <span>10 / WALLET</span>
                  </div>
                </div>
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
                  After Reveal, each Vessel exposes its born identity. Later
                  Gate history is intended to remain a separate layer so the
                  original artwork and born traits do not need to be overwritten.
                </p>
              </article>

              <article id="docs-summoning">
                <div className="docs-status">
                  <i></i>Mint
                </div>
                <h2>THE SUMMONING</h2>
                <p>
                  The Summoning is the mint experience. A wallet selects a
                  quantity from 1 to 10, confirms the transaction, waits for
                  chain confirmation, and receives one or more Vessels.
                </p>
                <p>
                  A successful mint means a Vessel has answered. It does not
                  reveal the Vessel&apos;s final form immediately.
                </p>
                <div className="docs-spec">
                  <div className="ritual-row">
                    <span>Quantity</span>
                    <span>1–10</span>
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
                  Collection page uses the sealed state. When Reveal is
                  activated, that page can be updated to display actual Vessel
                  artwork, rarity and traits.
                </p>
                <p>
                  The exact Reveal timing and technical mechanism will be
                  published with the final launch parameters.
                </p>
              </article>

              <article id="docs-rite">
                <div className="docs-status">
                  <i></i>Future Layer
                </div>
                <h2>$RITE</h2>
                <p>
                  $RITE is conceptually separate from the Vessel itself. A
                  Vessel is the identity. $RITE is designed as the means to
                  participate in later ritual actions, eligibility and Gate
                  interactions.
                </p>
                <p>
                  For V1, $RITE remains a future-facing section. Live token
                  functionality can be connected when that phase is opened.
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
                  When the team opens the Gate, the same route can be replaced
                  with the live experience handled by the frontend and backend
                  team.
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
