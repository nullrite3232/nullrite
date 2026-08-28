"use client";

import { useState } from "react";
import { IntroGate } from "@/components/IntroGate";
import { useRitual } from "@/components/RitualContext";
import { RoutePagesV2 } from "@/components/RoutePagesV2";
import { RouteRouter } from "@/components/RouteRouter";
import { ASSETS, SITE } from "@/lib/siteConfig";
import { useProtocolPhase } from "@/lib/useProtocolPhase";

export default function Home() {
  const { open } = useRitual();
  const phase = useProtocolPhase();
  const [siteVisible, setSiteVisible] = useState(false);

  const openDocs = () => {
    document.querySelector<HTMLElement>('.main-nav a[data-nav="docs"]')?.click();
  };

  const openCollection = () => {
    document.querySelector<HTMLElement>('.main-nav a[data-nav="collection"]')?.click();
  };

  const primaryAction =
    phase.publicMintActive || !phase.summoningStarted
      ? open
      : openCollection;

  const primaryLabel = phase.isSoldOut || phase.revealed
    ? "View the Assembly"
    : phase.publicMintActive
      ? "Summon a Vessel"
      : phase.summoningStarted
        ? "View the Assembly"
        : "View the Summoning";

  const heroEyebrow = phase.isSoldOut
    ? "NULL RITE // ASSEMBLY COMPLETE"
    : phase.publicMintActive
      ? "NULL RITE // PUBLIC SUMMONING // OPEN"
      : phase.summoningStarted
        ? "NULL RITE // PUBLIC SUMMONING // PAUSED"
        : "NULL RITE // PRE-LAUNCH";

  const heroSubline = phase.isSoldOut
    ? "HAVE ANSWERED."
    : phase.publicMintActive
      ? "ARE ANSWERING."
      : phase.summoningStarted
        ? "ARE FORMING."
        : "WILL ANSWER.";

  const summoningLabel = phase.summoningState === "PRE_LAUNCH"
    ? "SEALED"
    : phase.summoningState;

  const publicPhaseLabel = phase.publicPhase.replaceAll("_", " ");

  return (
    <>
      <IntroGate onEnter={() => setSiteVisible(true)} />

      <div className={`site ${siteVisible ? "visible" : ""}`} id="site">
        <main id="top">
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow">{heroEyebrow}</div>
              <h1>
                3232 VESSELS<span className="small">{heroSubline}</span>
              </h1>
              <p className="lead">
                The forms remain hidden. Each Vessel enters NULL RITE with an
                identity of its own—and a history that has yet to be written.
              </p>
              <div className="actions">
                <button className="btn primary" onClick={primaryAction}>
                  {primaryLabel}
                </button>
                <button className="btn" onClick={openDocs}>
                  Read the Docs
                </button>
              </div>
              <div className="meta">
                <div>
                  <strong>3232</strong>
                  <span>Total Supply</span>
                </div>
                <div>
                  <strong>{summoningLabel}</strong>
                  <span>Summoning State</span>
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
                <video autoPlay muted loop playsInline preload="auto" src={ASSETS.gateLoop} />
              </div>
              <div className="gate-status">
                <div className="gate-status-row">
                  <span>Public Summoning</span>
                  <span>{summoningLabel}</span>
                </div>
                <div className="progress"><i style={{ width: `${phase.progress}%` }} /></div>
              </div>
            </div>
          </section>

          <section className="reveal" id="vessels">
            <div className="reveal-media">
              <img src={ASSETS.vesselGroup} alt="The Order — sealed Vessels" />
            </div>
            <div className="reveal-copy">
              <div className="eyebrow">THE VESSELS // BORN FORMS WITHHELD</div>
              <h2>THE FORMS<br />REMAIN SEALED.</h2>
              <p>
                Summoning creates a Vessel identity onchain without exposing its
                born form. Final artwork, traits and rarity remain hidden until The
                Reveal. The scene shown here represents the Order—not final NFT
                artwork or individual traits.
              </p>
              <div className="reveal-state">
                <span className="dot" />
                <span>REVEAL_PROTOCOL / {phase.revealState}</span>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section-head">
              <div>
                <div className="eyebrow">THE RITUAL SEQUENCE</div>
                <h2>The sequence begins<br />before the Gate.</h2>
              </div>
              <p>
                NULL RITE separates token launch, Summoning, Reveal and Gate
                progression so every state becomes a chapter rather than a single mint event.
              </p>
            </div>
            <div className="flow">
              <div className="step">
                <div className="n">01 / RITE</div>
                <h3>$RITE Awakens</h3>
                <p>
                  $RITE precedes Public Summoning and becomes ritual fuel for
                  eligibility, Offerings, decisions and specialized Gate access.
                </p>
              </div>
              <div className="step">
                <div className="n">02 / SUMMON</div>
                <h3>3232 Answer</h3>
                <p>
                  Vessels are summoned through NULL RITE using ETH. Their born forms remain sealed.
                </p>
              </div>
              <div className="step">
                <div className="n">03 / REVEAL</div>
                <h3>The Forms Surface</h3>
                <p>
                  Each Vessel reveals its born artwork, traits and rarity through the verifiable Reveal process.
                </p>
              </div>
              <div className="step">
                <div className="n">04 / GATE</div>
                <h3>The History Begins</h3>
                <p>
                  Later Gates force irreversible decisions that become part of each Vessel&apos;s persistent Record.
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
                <h2>The means to act.<br />Not the identity itself.</h2>
                <p>
                  $RITE and Vessels serve different roles. A Vessel is the identity
                  that walks the path. $RITE is ritual fuel for eligibility,
                  Offerings, decisions and specialized Gate access. Its public token
                  action remains sealed until its launch state opens.
                </p>
                <div className="rite-points">
                  <div className="rp"><span>Eligibility</span><span>Launch conditions and specialized access</span></div>
                  <div className="rp"><span>Offering</span><span>Seal certain Gate actions and decisions</span></div>
                  <div className="rp"><span>Access</span><span>Requirements for specialized rituals</span></div>
                  <div className="rp"><span>Vessel</span><span>Carries the history and progression</span></div>
                </div>
              </div>
            </div>
          </section>

          <section className="section resonance-section" id="resonance">
            <div className="resonance-grid">
              <div className="resonance-copy">
                <div className="eyebrow">THE RESONANCE // COMPLETION HAS CONSEQUENCE</div>
                <h2>COMPLETE THE GATE.<br />EARN RESONANCE.</h2>
                <p>
                  Completing the published conditions of a Main Gate earns
                  eligibility for that Gate&apos;s disclosed Resonance Pool. A Pool may
                  contain $RITE, ETH, Relics, access or other specifically announced
                  rewards. Its contents and distribution rules are disclosed before entry.
                </p>
                <p className="resonance-note">
                  Holding a Vessel alone is not enough. Eligibility is earned through completion.
                </p>
              </div>

              <div className="resonance-terminal" aria-label="Resonance protocol">
                <div className="resonance-terminal-head">GATE PROTOCOL // SEALED</div>
                <div className="resonance-line"><span>Entry</span><strong>VESSEL</strong></div>
                <div className="resonance-line"><span>Offering</span><strong>IF REQUIRED</strong></div>
                <div className="resonance-line"><span>Accepted Offering</span><strong className="burn">BURNED</strong></div>
                <div className="resonance-line"><span>Completion</span><strong>PUBLISHED CONDITIONS</strong></div>
                <div className="resonance-line"><span>Resonance</span><strong className="earned">ELIGIBILITY EARNED</strong></div>
              </div>
            </div>

            <div className="resonance-flow" aria-label="Gate completion flow">
              <div className="resonance-step"><span>01 / ENTER</span><strong>Enter the Gate</strong></div>
              <div className="resonance-step"><span>02 / PATH</span><strong>Face the Path</strong></div>
              <div className="resonance-step"><span>03 / OFFER</span><strong>Offer if Required</strong></div>
              <div className="resonance-step"><span>04 / COMPLETE</span><strong>Complete Conditions</strong></div>
              <div className="resonance-step"><span>05 / RESONATE</span><strong>Earn Eligibility</strong></div>
            </div>
          </section>

          <section className="section" id="record">
            <div className="section-head">
              <div>
                <div className="eyebrow">THE RECORD</div>
                <h2>The artwork is born once.<br />The history keeps changing.</h2>
              </div>
              <p>
                Born traits stay intact. Gate decisions live as a separate history layer tied to the Vessel.
              </p>
            </div>
            <div className="duo">
              <div className="panel">
                <div className="eyebrow">VESSEL // SEALED RECORD</div>
                <h3>BORN</h3>
                <p>Born metadata remains the Vessel&apos;s original visual identity.</p>
                <div className="record-lines">
                  <div><span>VESSEL_ID</span><span>SEALED</span></div>
                  <div><span>RARITY</span><span>WITHHELD</span></div>
                  <div><span>TRAITS</span><span>WITHHELD</span></div>
                </div>
              </div>
              <div className="panel" id="gate-teaser">
                <div className="eyebrow">GATE // SEALED</div>
                <h3>THE RECORD</h3>
                <p>
                  Once the Gate opens, sealed decisions can permanently affect what future Gates show that Vessel.
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
              <p>The Gate does not give a Vessel something. The Gate makes the Vessel choose something.</p>
              <div className="actions" style={{ justifyContent: "center" }}>
                <button className="btn primary" onClick={primaryAction}>{primaryLabel}</button>
                <button className="btn" onClick={openDocs}>Read the Docs</button>
              </div>
            </div>
          </section>
        </main>

        <footer className="footer">
          <span>NULL RITE // {phase.minted === null ? SITE.supply : `${phase.minted} / ${SITE.supply}`} VESSELS</span>
          <span>ROBINHOOD CHAIN // {publicPhaseLabel}</span>
        </footer>
      </div>

      <RoutePagesV2 />
      <RouteRouter />
    </>
  );
}
