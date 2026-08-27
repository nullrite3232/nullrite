"use client";

import { useState } from "react";
import { IntroGate } from "@/components/IntroGate";
import { useRitual } from "@/components/RitualContext";
import { RoutePages } from "@/components/RoutePages";
import { RouteRouter } from "@/components/RouteRouter";
import { ASSETS, SITE } from "@/lib/siteConfig";
import { useAssemblySupply } from "@/lib/useAssemblySupply";

export default function Home() {
  const { open } = useRitual();
  const [siteVisible, setSiteVisible] = useState(false);
  const { minted, progress } = useAssemblySupply();

  const openDocs = () => {
    const link = document.querySelector<HTMLElement>(
      '.main-nav a[data-nav="docs"]'
    );
    link?.click();
  };

  return (
    <>
      <IntroGate onEnter={() => setSiteVisible(true)} />

      <div className={`site ${siteVisible ? "visible" : ""}`} id="site">
        <main id="top">
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow">THE ASSEMBLY // TESTNET // PRE-REVEAL</div>
              <h1>
                3,232 VESSELS<span className="small">WILL ANSWER.</span>
              </h1>
              <p className="lead">
                The forms remain hidden. Every Vessel will enter NULL RITE with
                an identity of its own—and a history that has yet to be written.
                The current Summoning flow is running on Robinhood Testnet while
                the launch interface is finalized.
              </p>
              <div className="actions">
                <button className="btn primary" onClick={open}>
                  Summon a Vessel
                </button>
                <button className="btn" disabled aria-disabled="true">
                  $RITE // SEALED
                </button>
              </div>
              <div className="meta">
                <div>
                  <strong>3,232</strong>
                  <span>Total Supply</span>
                </div>
                <div>
                  <strong>Sealed</strong>
                  <span>Reveal State</span>
                </div>
                <div>
                  <strong>Sealed</strong>
                  <span>Gate State</span>
                </div>
              </div>
            </div>

            <div className="hero-gate">
              <div className="gate-orbit" />
              <div className="gate-window">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  src={ASSETS.gateLoop}
                />
              </div>
              <div className="gate-status">
                <div className="gate-status-row">
                  <span>The Assembly</span>
                  <span>
                    {minted === null ? "—" : minted.toLocaleString()} / {SITE.supply.toLocaleString()}
                  </span>
                </div>
                <div className="progress">
                  <i style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          </section>

          <section className="reveal" id="vessels">
            <div className="reveal-media">
              <img src={ASSETS.vesselGroup} alt="The Order — sealed Vessels" />
            </div>
            <div className="reveal-copy">
              <div className="eyebrow">THE VESSELS // IDENTITY WITHHELD</div>
              <h2>
                THE FORMS
                <br />
                REMAIN SEALED.
              </h2>
              <p>
                Minting summons a Vessel, but does not immediately expose its
                final identity. The collection remains hidden until the reveal
                event. The scene shown here represents the Order—not the final
                NFT artwork or individual traits.
              </p>
              <div className="reveal-state">
                <span className="dot" />
                <span>REVEAL_PROTOCOL / DORMANT</span>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section-head">
              <div>
                <div className="eyebrow">THE RITUAL SEQUENCE</div>
                <h2>
                  Mint first.
                  <br />
                  The path comes later.
                </h2>
              </div>
              <p>
                NULL RITE separates acquisition, reveal, and Gate progression so
                every stage feels like a chapter rather than a normal mint flow.
              </p>
            </div>
            <div className="flow">
              <div className="step">
                <div className="n">01 / RITE</div>
                <h3>$RITE Awakens</h3>
                <p>
                  $RITE is a future ritual layer. It remains sealed during the
                  current testnet phase.
                </p>
              </div>
              <div className="step">
                <div className="n">02 / SUMMON</div>
                <h3>3,232 Answer</h3>
                <p>
                  Vessels mint through the NULL RITE site using ETH. Their final
                  forms remain sealed.
                </p>
              </div>
              <div className="step">
                <div className="n">03 / REVEAL</div>
                <h3>The Forms Surface</h3>
                <p>
                  Each Vessel reveals its original artwork, born traits, rarity
                  and token identity.
                </p>
              </div>
              <div className="step">
                <div className="n">04 / GATE</div>
                <h3>The History Begins</h3>
                <p>
                  Later Gates force irreversible decisions that become part of
                  each Vessel&apos;s persistent Record.
                </p>
              </div>
            </div>
          </section>

          <section className="section" id="rite">
            <div className="rite-grid">
              <div className="rite-core">
                <img className="rite-core-image" src={ASSETS.riteCore} alt="$RITE — the Rite Core" />
              </div>
              <div className="rite-copy">
                <div className="eyebrow">$RITE // RITUAL FUEL // SEALED</div>
                <h2>
                  The means to act.
                  <br />
                  Not the identity itself.
                </h2>
                <p>
                  $RITE and VESSELS serve different roles. A Vessel is the
                  identity that walks the path. $RITE is designed as ritual fuel
                  for eligibility, Offerings, decisions and future Gate access.
                  No live $RITE action is exposed in the current testnet phase.
                </p>
                <div className="rite-points">
                  <div className="rp">
                    <span>Priority</span>
                    <span>Snapshot / THE CHOSEN</span>
                  </div>
                  <div className="rp">
                    <span>Offering</span>
                    <span>Seal irreversible Gate decisions</span>
                  </div>
                  <div className="rp">
                    <span>Access</span>
                    <span>Requirements for specialized rituals</span>
                  </div>
                  <div className="rp">
                    <span>Vessel</span>
                    <span>Owns the history and progression</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="section" id="record">
            <div className="section-head">
              <div>
                <div className="eyebrow">THE RECORD</div>
                <h2>
                  The artwork is born once.
                  <br />
                  The history keeps changing.
                </h2>
              </div>
              <p>
                Born traits stay intact. Gate decisions live as a separate history
                layer tied to the Vessel.
              </p>
            </div>
            <div className="duo">
              <div className="panel">
                <div className="eyebrow">VESSEL // SAMPLE RECORD</div>
                <h3>BORN</h3>
                <p>
                  Original metadata remains the immutable visual identity of the
                  collection.
                </p>
                <div className="record-lines">
                  <div><span>VESSEL_ID</span><span>SEALED</span></div>
                  <div><span>RARITY</span><span>WITHHELD</span></div>
                  <div><span>TRAITS</span><span>WITHHELD</span></div>
                </div>
              </div>
              <div className="panel" id="gate-teaser">
                <div className="eyebrow">GATE // FUTURE STATE</div>
                <h3>THE RECORD</h3>
                <p>
                  Once the Gate opens, decisions such as KNEEL, WITNESS or REFUSE
                  can permanently affect what future Gates show that Vessel.
                </p>
                <div className="record-lines">
                  <div><span>GATE_I</span><span>NOT OPENED</span></div>
                  <div><span>GATE_II</span><span>UNDEFINED</span></div>
                  <div><span>CLASS</span><span>UNDEFINED</span></div>
                </div>
              </div>
            </div>
          </section>

          <section className="final" id="closing">
            <div className="final-inner">
              <div className="eyebrow">NULL RITE // THE GATE REMAINS SEALED</div>
              <h2>EVERY CHOICE CHANGES WHAT COMES NEXT.</h2>
              <p>
                The Gate does not give a Vessel something. The Gate makes the
                Vessel choose something.
              </p>
              <div className="actions" style={{ justifyContent: "center" }}>
                <button className="btn primary" onClick={open}>
                  Summon a Vessel
                </button>
                <button className="btn" onClick={openDocs}>
                  Read the Record
                </button>
              </div>
            </div>
          </section>
        </main>

        <footer className="footer">
          <span>NULL RITE // 3,232 VESSELS</span>
          <span>ROBINHOOD TESTNET // V1 WEB CONCEPT</span>
        </footer>
      </div>

      <RoutePages />
      <RouteRouter />
    </>
  );
}
