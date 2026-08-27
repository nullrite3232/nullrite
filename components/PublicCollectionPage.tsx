"use client";

import { CollectionPage } from "@/components/CollectionPage";
import { useRitual } from "@/components/RitualContext";
import { SITE } from "@/lib/siteConfig";
import { useProtocolPhase } from "@/lib/useProtocolPhase";

export function PublicCollectionPage() {
  const { open } = useRitual();
  const phase = useProtocolPhase();

  if (
    phase.summoningStarted ||
    phase.publicMintActive ||
    phase.isSoldOut ||
    phase.revealed
  ) {
    return <CollectionPage />;
  }

  return (
    <section className="route-page" id="collectionPage" aria-hidden="true">
      <div className="route-inner collection-route-inner">
        <div className="route-topline">
          <div className="route-code">NULL RITE // COLLECTION // PRE-LAUNCH</div>
          <button className="route-back" data-close-page>← Return Home</button>
        </div>

        <div className="collection-live-head">
          <div className="collection-live-copy">
            <div className="eyebrow">THE ASSEMBLY // SEALED</div>
            <h1 className="route-title">THE ASSEMBLY</h1>
            <div className="collection-live-count">
              <strong>— / {SITE.supply}</strong>
              <span>PUBLIC SUMMONING HAS NOT BEGUN.</span>
            </div>
            <p className="route-sub">
              The Assembly becomes the public archive of every Vessel that answers
              the Summoning. Until that chapter opens, the public Assembly remains sealed.
            </p>
          </div>

          <div className="collection-meter">
            <div className="collection-meter-top">
              <span>Public Assembly</span>
              <strong>SEALED</strong>
            </div>
            <div className="progress collection-progress"><i style={{ width: "0%" }} /></div>
            <div className="collection-meter-meta">
              <div><span>Summoning</span><strong>SEALED</strong></div>
              <div><span>Reveal</span><strong>SEALED</strong></div>
            </div>
          </div>
        </div>

        <div className="assembly-empty">
          <div>
            <div className="eyebrow">THE ASSEMBLY // AWAITING FIRST ANSWER</div>
            <h2>No public Vessel has answered yet.</h2>
            <p>
              When Public Summoning opens, confirmed Vessel identities will appear
              here while their born forms remain withheld until The Reveal.
            </p>
            <button className="btn primary" onClick={open}>View the Summoning</button>
          </div>
        </div>
      </div>
    </section>
  );
}
