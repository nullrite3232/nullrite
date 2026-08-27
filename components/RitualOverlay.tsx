"use client";

import { useState, useEffect, useRef } from "react";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { RH_TESTNET_CHAIN } from "@/lib/chain";
import { SITE } from "@/lib/siteConfig";
import { ASSETS } from "@/lib/siteConfig";

const MINT_ABI = [
  {
    type: "function",
    name: "mint",
    stateMutability: "payable",
    inputs: [{ name: "quantity", type: "uint256" }],
    outputs: [],
  },
] as const;

type Stage = "config" | "signature" | "chain" | "success";

const STAGE_LABEL: Record<Stage, string> = {
  config: "THE SUMMONING",
  signature: "AWAITING SIGNATURE",
  chain: "AWAITING THE CHAIN",
  success: "VESSEL ANSWERED",
};

export function RitualOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { openConnectModal } = useConnectModal() ?? {};
  const { switchChain } = useSwitchChain();
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const [stage, setStage] = useState<Stage>("config");
  const [qty, setQty] = useState(1);
  const [ids, setIds] = useState<string[]>([]);
  const [txError, setTxError] = useState<string | null>(null);
  const qtyElRef = useRef<HTMLDivElement>(null);

  // v15: vesselBase starts at 1847, advances by a random 1..7 each summoning.
  const vesselBaseRef = useRef(1847);

  useEffect(() => {
    if (open) {
      setStage("config");
      setQty(1);
      setIds([]);
      setTxError(null);
      reset();
    }
  }, [open, reset]);

  // Format with enough decimals for sub-cent prices (contract: 0.0001 ETH)
  const fmtEth = (n: number) => Number(n.toFixed(4)).toString();
  const cost = fmtEth(SITE.mintPriceEth * qty);

  useEffect(() => {
    if (hash) setStage("chain");
  }, [hash]);

  useEffect(() => {
    if (isConfirmed) {
      vesselBaseRef.current += Math.floor(Math.random() * 7) + 1;
      const base = vesselBaseRef.current;
      setIds(Array.from({ length: qty }, (_, i) => `VESSEL #${base + i}`));
      setStage("success");
    }
  }, [isConfirmed, qty]);

  const setQtySafe = (n: number) => {
    const next = Math.max(1, Math.min(SITE.maxPerTx, n));
    setQty(next);
    // v15 counter pop animation (Web Animations API)
    const el = qtyElRef.current;
    if (el && typeof el.animate === "function") {
      el.animate(
        [
          { opacity: 0.35, transform: "scale(.92)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        { duration: 180, easing: "ease-out" }
      );
    }
  };

  const begin = () => {
    setTxError(null);
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    if (chainId !== RH_TESTNET_CHAIN.id) {
      try {
        switchChain({ chainId: RH_TESTNET_CHAIN.id });
      } catch {
        /* user may need to approve network switch */
      }
    }
    setStage("signature");
    try {
      writeContract({
        address: SITE.contractAddress as `0x${string}`,
        abi: MINT_ABI,
        functionName: "mint",
        args: [BigInt(qty)],
        value: parseEther(cost),
      });
    } catch (e: any) {
      setTxError(e?.message ?? "Transaction failed");
      setStage("config");
    }
  };

  const proceedSignature = () => {
    if (hash || isPending) {
      setStage("chain");
    } else {
      begin(); // wallet flow still pending → re-trigger signature request
    }
  };

  const proceedChain = () => {
    if (isConfirmed) setStage("success");
    // v15 prototype button kept for parity; without a real confirmation it stays put.
  };

  const close = () => {
    onClose();
    setTimeout(() => {
      setStage("config");
    }, 180);
  };

  if (!open) return null;

  const plural = qty > 1;
  const successHeading = plural
    ? `${qty} Vessels have answered.`
    : "A Vessel has answered.";
  const successCopy = plural
    ? "Their final forms remain sealed. The Reveal event will expose each born identity, traits, and rarity later."
    : "Its final form remains sealed. The Reveal event will expose its born identity, traits, and rarity later.";
  const successIdLabel = plural ? "Vessel IDs" : "Vessel ID";
  const successIdsHtml = ids.join("<br>");

  return (
    <div className="ritual-overlay show" id="ritualOverlay">
      <div className="ritual-shell">
        <div className="ritual-panel">
          <div className="ritual-topbar">
            <div className="ritual-stage-tag" id="ritualStageTag">
              {STAGE_LABEL[stage]}
            </div>
            <button
              className="ritual-close"
              id="ritualClose"
              onClick={close}
              aria-label="Close summoning"
            >
              ×
            </button>
          </div>

          {/* CONFIG */}
          <section
            className={`ritual-view ritual-config ${stage === "config" ? "active" : ""}`}
            id="viewConfig"
          >
            <div className="ritual-visual">
              <img src={ASSETS.sealedVessel} alt="Sealed Vessel" />
            </div>
            <div className="ritual-copy">
              <div className="eyebrow">THE SUMMONING</div>
              <h2>Call a Vessel.</h2>
              <p>
                Something beyond the Gate is listening. Select how many Vessels
                will answer. Up to 10 may be summoned per wallet. Their final
                identities remain sealed until reveal.
              </p>
              <div className="ritual-qty-wrap">
                <div className="ritual-label">Select how many will answer</div>
                <div className="summon-counter">
                  <button
                    className="counter-btn"
                    id="qtyMinus"
                    aria-label="Decrease quantity"
                    disabled={qty <= 1}
                    onClick={() => setQtySafe(qty - 1)}
                  >
                    −
                  </button>
                  <div className="counter-center">
                    <div className="counter-value" id="ritualQty" ref={qtyElRef}>
                      {qty}
                    </div>
                    <div className="counter-caption">
                      {plural ? "VESSELS" : "VESSEL"}
                    </div>
                  </div>
                  <button
                    className="counter-btn"
                    id="qtyPlus"
                    aria-label="Increase quantity"
                    disabled={qty >= SITE.maxPerTx}
                    onClick={() => setQtySafe(qty + 1)}
                  >
                    +
                  </button>
                </div>
                <div className="counter-meta">
                  <span>MIN / 1</span>
                  <span>MAX / {SITE.maxPerTx} PER SUMMONING</span>
                </div>
              </div>
              <div className="ritual-data">
                <div className="ritual-row">
                  <span>Summoning Cost</span>
                  <span id="sumCost">{cost} ETH</span>
                </div>
                <div className="ritual-row">
                  <span>Network</span>
                  <span>Robinhood Chain</span>
                </div>
                <div className="ritual-row">
                  <span>Reveal State</span>
                  <span>SEALED</span>
                </div>
                <div className="ritual-row">
                  <span>Vessels Remaining</span>
                  <span>3,232 / 3,232</span>
                </div>
              </div>
              {txError && <div className="ritual-error">{txError}</div>}
              <div className="ritual-actions">
                <button className="btn" id="ritualCancel" onClick={close}>
                  Cancel
                </button>
                <button className="btn primary" id="ritualBegin" onClick={begin}>
                  Begin the Rite
                </button>
              </div>
            </div>
          </section>

          {/* SIGNATURE */}
          <section
            className={`ritual-view ritual-await ${stage === "signature" ? "active" : ""}`}
            id="viewSignature"
          >
            <div className="ritual-await-inner">
              <div className="await-art">
                <img src={ASSETS.sealedVessel} alt="Sealed Vessel" />
              </div>
              <div className="eyebrow">THE RITE AWAITS YOUR SIGNATURE</div>
              <h2 className="await-head">Awaiting Wallet.</h2>
              <p className="await-copy">
                Confirm the transaction in your wallet to call a Vessel through
                the Gate.
              </p>
              <div className="await-status">
                <div>
                  <span className={isPending ? "live" : "muted"}>
                    SIGNATURE REQUEST
                  </span>
                  <span className={isPending ? "live" : "muted"}>
                    {isPending ? "SIGNING" : "WAITING"}
                  </span>
                </div>
                <div>
                  <span className="muted">TRANSACTION SUBMITTED</span>
                  <span className="muted">WAITING</span>
                </div>
                <div>
                  <span className="muted">CONFIRMATION</span>
                  <span className="muted">WAITING</span>
                </div>
              </div>
              <div className="ritual-actions">
                <button
                  className="btn"
                  id="signatureBack"
                  onClick={() => setStage("config")}
                >
                  Simulate Rejected
                </button>
                <button
                  className="btn primary"
                  id="signatureProceed"
                  onClick={proceedSignature}
                >
                  Signature Accepted
                </button>
              </div>
            </div>
          </section>

          {/* CHAIN */}
          <section
            className={`ritual-view ritual-await ${stage === "chain" ? "active" : ""}`}
            id="viewChain"
          >
            <div className="ritual-await-inner">
              <div className="await-art">
                <img src={ASSETS.riteCore} alt="Rite Core" />
              </div>
              <div className="eyebrow">AWAITING THE CHAIN</div>
              <h2 className="await-head">A Vessel is answering.</h2>
              <p className="await-copy">
                The transaction has been submitted. The Gate is listening, and
                the final identity remains hidden until reveal.
              </p>
              <div className="await-status">
                <div>
                  <span className="done">SIGNATURE ACCEPTED</span>
                  <span className="done">DONE</span>
                </div>
                <div>
                  <span className="live">TRANSACTION SUBMITTED</span>
                  <span className={isConfirmed ? "done" : "live"}>
                    {isConfirmed ? "DONE" : "LIVE"}
                  </span>
                </div>
                <div>
                  <span
                    className={
                      isConfirmed ? "done" : isConfirming ? "live" : "muted"
                    }
                  >
                    CONFIRMATION
                  </span>
                  <span
                    className={
                      isConfirmed ? "done" : isConfirming ? "live" : "muted"
                    }
                  >
                    {isConfirmed
                      ? "DONE"
                      : isConfirming
                        ? "CONFIRMING"
                        : "PENDING"}
                  </span>
                </div>
              </div>
              <div className="ritual-actions">
                <button
                  className="btn primary"
                  id="chainProceed"
                  onClick={proceedChain}
                >
                  Simulate Confirmed
                </button>
              </div>
            </div>
          </section>

          {/* SUCCESS */}
          <section
            className={`ritual-view ritual-success ${stage === "success" ? "active" : ""}`}
            id="viewSuccess"
          >
            <div className="success-visual">
              <img src={ASSETS.sealedVessel} alt="Sealed Vessel" />
            </div>
            <div className="success-copy">
              <div className="eyebrow">THE SUMMONING // COMPLETE</div>
              <h2 id="successHeading">{successHeading}</h2>
              <p id="successCopy">{successCopy}</p>
              <div className="badge-live">
                <i></i>
                <span>IDENTITY // SEALED</span>
              </div>
              <div className="success-card">
                <div className="ritual-row">
                  <span id="successIdLabel">{successIdLabel}</span>
                  <span
                    id="successIds"
                    dangerouslySetInnerHTML={{ __html: successIdsHtml }}
                  />
                </div>
                <div className="ritual-row">
                  <span>Reveal State</span>
                  <span>SEALED</span>
                </div>
                <div className="ritual-row">
                  <span>Network</span>
                  <span>Robinhood Chain</span>
                </div>
                <div className="ritual-row">
                  <span>Gate State</span>
                  <span>SEALED</span>
                </div>
              </div>
              <div className="success-actions">
                <button className="btn" id="returnAssembly" onClick={close}>
                  Return to the Assembly
                </button>
                <button className="btn primary" id="viewVesselBtn" onClick={close}>
                  View Your Vessel
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
