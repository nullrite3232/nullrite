"use client";

import { ASSETS } from "@/lib/siteConfig";

export function SummoningPreviewOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  const openDocs = () => {
    onClose();
    setTimeout(() => {
      document.querySelector<HTMLElement>('.main-nav a[data-nav="docs"]')?.click();
    }, 0);
  };

  return (
    <div className="ritual-overlay show" id="ritualOverlay">
      <div className="ritual-shell">
        <div className="ritual-panel">
          <div className="ritual-topbar">
            <div className="ritual-stage-tag">THE SUMMONING // SEALED</div>
            <button className="ritual-close" onClick={onClose} aria-label="Close summoning">×</button>
          </div>

          <section className="ritual-view ritual-config active">
            <div className="ritual-visual">
              <img src={ASSETS.sealedVessel} alt="Sealed Vessel" />
            </div>
            <div className="ritual-copy">
              <div className="eyebrow">PUBLIC SUMMONING // NOT OPEN</div>
              <h2>The Assembly awaits.</h2>
              <p>
                Public Summoning has not begun. When it opens, Vessels will be
                summoned through NULL RITE using ETH and will remain visually
                sealed until The Reveal.
              </p>

              <div className="ritual-data">
                <div className="ritual-row"><span>Collection</span><span>3232 VESSELS</span></div>
                <div className="ritual-row"><span>Summoning</span><span>SEALED</span></div>
                <div className="ritual-row"><span>Currency</span><span>ETH</span></div>
                <div className="ritual-row"><span>Reveal</span><span>SEALED</span></div>
                <div className="ritual-row"><span>Gate</span><span>SEALED</span></div>
              </div>

              <p className="resonance-note">
                The Vessel contract, mint price and public limits will be disclosed before Summoning opens.
              </p>

              <div className="ritual-actions">
                <button className="btn" onClick={onClose}>Close</button>
                <button className="btn primary" onClick={openDocs}>Read the Docs</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
