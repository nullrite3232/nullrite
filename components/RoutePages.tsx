"use client";

import { CollectionPage } from "@/components/CollectionPage";

const DOC_NAV = [
  ["docs-current", "Current State"],
  ["docs-overview", "Overview"],
  ["docs-vessels", "Vessels"],
  ["docs-rite", "$RITE"],
  ["docs-summoning", "Summoning"],
  ["docs-assembly", "Assembly"],
  ["docs-reveal", "Reveal"],
  ["docs-fair-reveal", "Fair Reveal"],
  ["docs-gate", "The Gate"],
  ["docs-inside-gate", "Inside the Gate"],
  ["docs-offering", "The Offering"],
  ["docs-resonance", "Resonance Pool"],
  ["docs-completion", "Completion"],
  ["docs-record", "The Record"],
  ["docs-historical-rarity", "Historical Rarity"],
  ["docs-relics", "Relics"],
  ["docs-next", "What Happens Next"],
  ["docs-rule", "Rule of the Gate"],
  ["docs-onchain", "Onchain"],
  ["docs-faq", "FAQ"],
] as const;

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
            <div className="route-code">NULL RITE // SYSTEM DOCUMENTATION</div>
            <button className="route-back" data-close-page>
              ← Return Home
            </button>
          </div>

          <div className="docs-layout">
            <aside className="docs-index" aria-label="Documentation index">
              {DOC_NAV.map(([id, label]) => (
                <a href={`#${id}`} key={id}>{label}</a>
              ))}
            </aside>

            <div className="docs-content">
              <article id="docs-current">
                <div className="docs-status"><i></i>Current State // Sealed</div>
                <h2>THE CURRENT STATE</h2>
                <p>
                  NULL RITE begins with 3232 Vessels. Each summoned Vessel exists
                  as an onchain identity while its born artwork, traits and rarity
                  remain hidden until The Reveal.
                </p>
                <p>
                  The Assembly is forming. $RITE remains sealed. The Gate remains
                  sealed. When the current chapter is complete, the next state of
                  the ritual begins.
                </p>
                <div className="docs-spec">
                  <div className="ritual-row"><span>Assembly</span><span>FORMING</span></div>
                  <div className="ritual-row"><span>Identity</span><span>SEALED</span></div>
                  <div className="ritual-row"><span>$RITE</span><span>SEALED</span></div>
                  <div className="ritual-row"><span>Gate</span><span>SEALED</span></div>
                </div>
              </article>

              <article id="docs-overview">
                <div className="docs-status"><i></i>Project Overview</div>
                <h2>WHAT IS NULL RITE?</h2>
                <p>
                  NULL RITE is a persistent onchain ritual built around 3232
                  Vessels on Robinhood Chain. A Vessel is more than an image: it is
                  an identity capable of entering the Gate, making irreversible
                  decisions and accumulating a persistent Record.
                </p>
                <div className="docs-proof">
                  <strong>THE ARTWORK REPRESENTS WHAT A VESSEL IS.</strong>
                  <p>The Record represents what that Vessel becomes.</p>
                </div>
                <p>
                  Previous choices can change what later Gates reveal. The path is
                  therefore not a single linear progression shared by every Vessel.
                </p>
              </article>

              <article id="docs-vessels">
                <div className="docs-status"><i></i>Identity Layer</div>
                <h2>THE VESSEL</h2>
                <p>
                  Only 3232 Vessels will exist. Each Vessel receives its own token
                  identity onchain and enters the collection sealed.
                </p>
                <p>
                  After Reveal, its born artwork, traits and rarity become visible.
                  The artwork does not need to change for the Vessel to evolve. Its
                  evolution lives in the Record created by later Gate activity.
                </p>
                <div className="docs-spec">
                  <div className="ritual-row"><span>Supply</span><span>3232 VESSELS</span></div>
                  <div className="ritual-row"><span>Token Identity</span><span>ONCHAIN</span></div>
                  <div className="ritual-row"><span>Born Form</span><span>REVEALED LATER</span></div>
                  <div className="ritual-row"><span>Progression</span><span>THE RECORD</span></div>
                </div>
              </article>

              <article id="docs-rite">
                <div className="docs-status"><i></i>Ritual Fuel // Sealed</div>
                <h2>$RITE — THE MEANS TO ACT</h2>
                <p>
                  $RITE and Vessels serve different roles. A Vessel is the identity
                  that walks the path. $RITE is ritual fuel: the means that allows
                  that identity to act inside the system.
                </p>
                <p>
                  $RITE may be required for eligibility, Offerings, decision
                  sealing, specialized Gate access and future ritual interactions.
                  Holding $RITE does not replace owning a Vessel.
                </p>
                <div className="docs-proof">
                  <strong>A VESSEL IS THE IDENTITY.</strong>
                  <p>$RITE is the means to act.</p>
                </div>
              </article>

              <article id="docs-summoning">
                <div className="docs-status"><i></i>Mint</div>
                <h2>THE SUMMONING</h2>
                <p>
                  The Summoning is how a Vessel enters NULL RITE. Vessels are
                  summoned directly through the NULL RITE interface using ETH.
                </p>
                <p>
                  The live interface reads mint price, public mint state,
                  per-transaction limit and per-wallet limit from the Vessel
                  contract. After a transaction confirms, the Vessel exists
                  onchain immediately while its final form remains sealed.
                </p>
                <div className="docs-spec">
                  <div className="ritual-row"><span>Mint Currency</span><span>ETH</span></div>
                  <div className="ritual-row"><span>Mint Price</span><span>LIVE CONTRACT STATE</span></div>
                  <div className="ritual-row"><span>Per Transaction</span><span>LIVE CONTRACT STATE</span></div>
                  <div className="ritual-row"><span>Per Wallet</span><span>LIVE CONTRACT STATE</span></div>
                </div>
              </article>

              <article id="docs-assembly">
                <div className="docs-status"><i></i>Collection</div>
                <h2>THE ASSEMBLY</h2>
                <p>
                  The Assembly is the living archive of every Vessel that has
                  answered. Every successfully summoned token appears under ALL
                  VESSELS while MY VESSELS shows the Vessels currently held by the
                  connected wallet.
                </p>
                <p>
                  Before Reveal, each identity remains visually sealed. Reveal does
                  not replace the token: the same Vessel identity remains and its
                  born form simply becomes visible.
                </p>
              </article>

              <article id="docs-reveal">
                <div className="docs-status"><i></i>Post-Summoning</div>
                <h2>THE REVEAL</h2>
                <p>
                  The Summoning and The Reveal are separate events. Ownership and
                  token identity exist before the final art is exposed.
                </p>
                <p>
                  Token IDs remain sequential. Final artwork, traits and rarity are
                  assigned through the randomized Reveal process, so mint order does
                  not determine the final form a Vessel receives.
                </p>
                <div className="docs-proof">
                  <strong>THE TOKEN DOES NOT CHANGE.</strong>
                  <p>What was hidden becomes known.</p>
                </div>
              </article>

              <article id="docs-fair-reveal">
                <div className="docs-status"><i></i>Verifiable Assignment</div>
                <h2>FAIR REVEAL</h2>
                <p>
                  Before the Reveal seed is known, the complete 3232-item reveal
                  set will be frozen and committed through a published provenance
                  hash. The seed source will be declared before its value is
                  knowable.
                </p>
                <p>
                  Final token-ID-to-metadata assignment will be deterministic from
                  the public commitment and seed. The provenance commitment, seed
                  reference and assignment method will be published so anyone can
                  independently verify the result.
                </p>
                <div className="docs-proof">
                  <strong>THE ORDER CANNOT REARRANGE WHAT HAS ALREADY BEEN COMMITTED.</strong>
                  <p>Provenance fixes the set first. The later seed determines the assignment.</p>
                </div>
                <div className="docs-spec">
                  <div className="ritual-row"><span>Token IDs</span><span>SEQUENTIAL</span></div>
                  <div className="ritual-row"><span>Final Assignment</span><span>RANDOMIZED</span></div>
                  <div className="ritual-row"><span>Provenance</span><span>BEFORE SEED</span></div>
                  <div className="ritual-row"><span>Verification</span><span>PUBLIC</span></div>
                </div>
              </article>

              <article id="docs-gate">
                <div className="docs-status"><i></i>Core System // Sealed</div>
                <h2>THE GATE</h2>
                <p>
                  The Gate is where a Vessel begins to accumulate history. It is
                  not a passive claim screen. A Gate presents paths, conditions and
                  decisions that a Vessel must confront.
                </p>
                <p>
                  Once a decision is sealed, it cannot be undone. Previous choices
                  may alter what future Gates reveal, which means two Vessels can
                  enter the same system and eventually encounter different futures.
                </p>
                <div className="docs-proof">
                  <strong>THE GATE DOESN&apos;T GIVE YOU SOMETHING.</strong>
                  <p>The Gate makes you choose something.</p>
                </div>
              </article>

              <article id="docs-inside-gate">
                <div className="docs-status"><i></i>Mechanics Without Spoilers</div>
                <h2>INSIDE THE GATE</h2>
                <p>
                  A Vessel may encounter multiple paths, irreversible decisions,
                  conditions based on previous choices, specialized rituals,
                  interactions involving another Vessel, unlockable paths, paths
                  that can be permanently lost, Marks, classifications and rare
                  outcomes.
                </p>
                <p>
                  The exact choices, hidden conditions and outcomes of a Gate are
                  not published in advance. The mechanics are visible; the content
                  remains part of discovery.
                </p>
              </article>

              <article id="docs-offering">
                <div className="docs-status"><i></i>$RITE Sink</div>
                <h2>THE OFFERING</h2>
                <p>
                  Certain actions inside the Gate require an Offering in $RITE.
                  When an Offering is accepted, the $RITE committed to that action
                  is permanently burned.
                </p>
                <p>
                  The Offering does not purchase a guaranteed outcome. It seals
                  participation, commitment or a decision according to that Gate&apos;s
                  published rules. Exact Offering amounts are defined per Gate,
                  rather than permanently fixed in this document.
                </p>
                <div className="docs-proof">
                  <strong>WHAT IS BURNED CANNOT RETURN.</strong>
                  <p>What is chosen cannot be undone.</p>
                </div>
              </article>

              <article id="docs-resonance">
                <div className="docs-status"><i></i>Completion Rewards</div>
                <h2>THE RESONANCE POOL</h2>
                <p>
                  Every Main Gate carries a disclosed Resonance Pool. Its contents,
                  funding reference, completion requirements and distribution rules
                  are published before that Gate opens.
                </p>
                <p>
                  A Pool may contain $RITE, ETH, Relics, access, collaborator assets
                  or other announced rewards. The Pool is funded separately before
                  entry; accepted Offerings do not fund the reward promised by that
                  same Gate.
                </p>
                <p>
                  Hidden or side rituals may operate differently and are not
                  required to carry a Resonance Pool.
                </p>
                <div className="docs-proof">
                  <strong>HOLDING IS NOT ENOUGH.</strong>
                  <p>Completion earns eligibility for Resonance.</p>
                </div>
              </article>

              <article id="docs-completion">
                <div className="docs-status"><i></i>Eligibility & Distribution</div>
                <h2>COMPLETION</h2>
                <p>
                  Entering a Gate is not enough. A Vessel must satisfy the published
                  completion conditions before the participating wallet becomes
                  eligible for that Main Gate&apos;s Resonance Pool.
                </p>
                <p>
                  Completion establishes base eligibility. A Gate may apply bounded
                  Resonance Weight modifiers based on paths, Marks or completion
                  states so the Record can matter without turning one path into an
                  unlimited multiplier. Exact weights are disclosed before entry.
                </p>
                <p>
                  Main Gates may also publish a reward-bearing Vessel cap per wallet
                  to limit concentrated Pool capture. The cap is disclosed before
                  participation and does not prevent additional Vessels from building
                  their Record.
                </p>
                <div className="docs-spec">
                  <div className="ritual-row"><span>Base Eligibility</span><span>COMPLETE THE GATE</span></div>
                  <div className="ritual-row"><span>Weight</span><span>BOUNDED // GATE-SPECIFIC</span></div>
                  <div className="ritual-row"><span>Wallet Cap</span><span>DISCLOSED PER GATE</span></div>
                  <div className="ritual-row"><span>Past Reward Right</span><span>COMPLETING WALLET</span></div>
                </div>
              </article>

              <article id="docs-record">
                <div className="docs-status"><i></i>Persistent History</div>
                <h2>THE RECORD</h2>
                <p>
                  Every Vessel is born with an identity. The Record begins when
                  that identity starts making decisions. It may include Gate
                  participation, choices, Offerings, Marks, classifications,
                  unlocked paths, completed rituals and Resonance history.
                </p>
                <p>
                  The Record belongs to the Vessel and remains attached if ownership
                  changes. Reward entitlement already earned from a completed Gate
                  belongs to the wallet that completed it; transferring the Vessel
                  does not transfer an old unclaimed entitlement unless a future
                  Gate explicitly states otherwise.
                </p>
                <div className="docs-proof">
                  <strong>REWARDS BELONG TO THE PARTICIPANT.</strong>
                  <p>History belongs to the Vessel.</p>
                </div>
              </article>

              <article id="docs-historical-rarity">
                <div className="docs-status"><i></i>Earned Differentiation</div>
                <h2>HISTORICAL RARITY</h2>
                <p>
                  Born rarity is revealed. Historical rarity is earned. Two Vessels
                  can begin with similar born traits and later carry completely
                  different Records.
                </p>
                <p>
                  One may carry a Mark another can no longer obtain, unlock a path
                  another permanently lost, or accumulate a sequence of decisions
                  that cannot be reproduced by a fresh Vessel.
                </p>
                <div className="docs-proof">
                  <strong>BORN RARITY IS REVEALED.</strong>
                  <p>Historical rarity is earned.</p>
                </div>
              </article>

              <article id="docs-relics">
                <div className="docs-status"><i></i>Rare Vessel-Bound Artifacts</div>
                <h2>RELICS</h2>
                <p>
                  Certain rare paths, hidden conditions or exceptional completion
                  states may reveal Relics. Relics are official rare artifacts bound
                  to the Vessel&apos;s Record rather than guaranteed rewards for every
                  participant.
                </p>
                <p>
                  A Relic may act as proof of a path, a future access key, a special
                  ritual condition or another disclosed function. Because it is
                  Vessel-bound, the Relic and its history remain with the Vessel when
                  ownership changes.
                </p>
              </article>

              <article id="docs-next">
                <div className="docs-status"><i></i>Ritual Sequence</div>
                <h2>WHAT HAPPENS NEXT?</h2>
                <p>
                  NULL RITE is designed as a sequence of states rather than a mint
                  that ends at Reveal.
                </p>
                <div className="docs-spec">
                  <div className="ritual-row"><span>01 // $RITE</span><span>THE FUEL AWAKENS</span></div>
                  <div className="ritual-row"><span>02 // SUMMONING</span><span>3232 VESSELS ANSWER</span></div>
                  <div className="ritual-row"><span>03 // ASSEMBLY</span><span>IDENTITIES FORM ONCHAIN</span></div>
                  <div className="ritual-row"><span>04 // REVEAL</span><span>BORN FORMS SURFACE</span></div>
                  <div className="ritual-row"><span>05 // RESONANCE</span><span>THE GATE RESPONDS</span></div>
                  <div className="ritual-row"><span>06 // GATE</span><span>CHOICES BEGIN</span></div>
                  <div className="ritual-row"><span>07 // OFFERING</span><span>$RITE BURNS</span></div>
                  <div className="ritual-row"><span>08 // COMPLETION</span><span>RESONANCE ELIGIBILITY</span></div>
                  <div className="ritual-row"><span>09 // RECORD</span><span>HISTORY EXPANDS</span></div>
                </div>
              </article>

              <article id="docs-rule">
                <div className="docs-status"><i></i>Core Principle</div>
                <h2>THE RULE OF THE GATE</h2>
                <div className="docs-proof docs-rule-proof">
                  <strong>THE GATE DOESN&apos;T GIVE YOU SOMETHING.</strong>
                  <p>The Gate makes you choose something.</p>
                </div>
                <div className="docs-proof docs-rule-proof">
                  <strong>EVERY CHOICE CHANGES WHAT THE NEXT GATE SHOWS YOU.</strong>
                  <p>The Offering is burned. The completion is rewarded. The history remains.</p>
                </div>
              </article>

              <article id="docs-onchain">
                <div className="docs-status"><i></i>Transparency</div>
                <h2>ONCHAIN</h2>
                <p>
                  The parts of NULL RITE that define ownership, Summoning, Reveal
                  verification, Gate decisions, Offerings and published Pool rules
                  are designed to leave verifiable references rather than rely only
                  on interface copy.
                </p>
                <div className="docs-spec">
                  <div className="ritual-row"><span>Network</span><span>ROBINHOOD CHAIN</span></div>
                  <div className="ritual-row"><span>Collection</span><span>3232 VESSELS</span></div>
                  <div className="ritual-row"><span>Mint Currency</span><span>ETH</span></div>
                  <div className="ritual-row"><span>Reveal</span><span>PROVENANCE + PUBLIC SEED</span></div>
                  <div className="ritual-row"><span>Offerings</span><span>VERIFIABLE BURNS</span></div>
                  <div className="ritual-row"><span>Main Gate Pools</span><span>DISCLOSED BEFORE ENTRY</span></div>
                  <div className="ritual-row"><span>Gate Rules</span><span>PUBLISHED PER GATE</span></div>
                </div>
              </article>

              <article id="docs-faq">
                <div className="docs-status"><i></i>Quick Answers</div>
                <h2>FAQ</h2>

                <h3 className="docs-subhead">What do I receive when I summon a Vessel?</h3>
                <p>
                  An onchain Vessel capable of participating in NULL RITE. Its born
                  artwork, traits and rarity remain sealed until The Reveal.
                </p>

                <h3 className="docs-subhead">Does owning a Vessel automatically earn rewards?</h3>
                <p>
                  No. Main Gate Resonance eligibility is earned through published
                  completion conditions, not passive ownership alone.
                </p>

                <h3 className="docs-subhead">Does every Main Gate have a Resonance Pool?</h3>
                <p>
                  Yes. Every Main Gate discloses its funded Pool, requirements and
                  distribution rules before it opens. Hidden or side rituals may
                  operate differently.
                </p>

                <h3 className="docs-subhead">What can a Resonance Pool contain?</h3>
                <p>
                  Depending on the Gate: $RITE, ETH, Relics, access, collaborator
                  assets or other specifically announced rewards.
                </p>

                <h3 className="docs-subhead">Do Offerings fund that same Gate&apos;s reward?</h3>
                <p>
                  No. Accepted $RITE Offerings are burned. A Main Gate&apos;s Resonance
                  Pool is funded and disclosed separately before participation.
                </p>

                <h3 className="docs-subhead">Can Gate choices be reversed?</h3>
                <p>Once a decision is sealed, no.</p>

                <h3 className="docs-subhead">Does every Vessel see the same future Gate?</h3>
                <p>
                  Not necessarily. A Vessel&apos;s existing Record can alter future
                  paths, conditions or available decisions.
                </p>

                <h3 className="docs-subhead">What happens if I transfer my Vessel?</h3>
                <p>
                  The Vessel&apos;s Record and Vessel-bound Relics remain with the
                  Vessel. Reward rights already earned by a completing wallet remain
                  with that completing wallet.
                </p>

                <h3 className="docs-subhead">Are Relics guaranteed?</h3>
                <p>
                  No. Relics are rare Vessel-bound outcomes associated with specific
                  paths, hidden conditions or exceptional completion states.
                </p>

                <h3 className="docs-subhead">Are Offering amounts, weights and wallet caps fixed forever?</h3>
                <p>
                  No. Those are Gate-specific parameters. They are published before
                  entry so participants know the rules before committing.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
