"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePublicClient } from "wagmi";
import { ASSETS } from "@/lib/siteConfig";
import { RUNTIME } from "@/lib/runtime";

const OWNER_OF_ABI = [
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

type VesselDetailModalProps = {
  tokenId: number | null;
  onClose: () => void;
};

function padTokenId(id: number) {
  return id.toString().padStart(4, "0");
}

function shortAddress(address?: string | null) {
  if (!address) return "—";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function VesselDetailModal({ tokenId, onClose }: VesselDetailModalProps) {
  const publicClient = usePublicClient({ chainId: RUNTIME.chain.id });
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [owner, setOwner] = useState<string | null>(null);
  const [ownerState, setOwnerState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [readNonce, setReadNonce] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (tokenId === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => closeRef.current?.focus(), 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [tokenId, onClose]);

  useEffect(() => {
    if (tokenId === null) {
      setOwner(null);
      setOwnerState("idle");
      return;
    }

    if (!RUNTIME.contractConfigured || !publicClient) {
      setOwner(null);
      setOwnerState("error");
      return;
    }

    let cancelled = false;

    const readOwner = async () => {
      setOwner(null);
      setOwnerState("loading");

      try {
        let lastError: unknown;
        let result: unknown;

        for (let attempt = 0; attempt < 2; attempt += 1) {
          try {
            result = await publicClient.readContract({
              address: RUNTIME.contractAddress,
              abi: OWNER_OF_ABI,
              functionName: "ownerOf",
              args: [BigInt(tokenId)],
            });
            lastError = undefined;
            break;
          } catch (error) {
            lastError = error;
            if (attempt === 0) {
              await new Promise((resolve) => setTimeout(resolve, 180));
            }
          }
        }

        if (lastError || typeof result !== "string") {
          throw lastError ?? new Error("Invalid ownerOf response");
        }

        if (!cancelled) {
          setOwner(result);
          setOwnerState("ready");
        }
      } catch {
        if (!cancelled) {
          setOwner(null);
          setOwnerState("error");
        }
      }
    };

    void readOwner();

    return () => {
      cancelled = true;
    };
  }, [tokenId, publicClient, readNonce]);

  if (!mounted || tokenId === null) return null;

  const paddedId = padTokenId(tokenId);
  const explorerBase = RUNTIME.chain.blockExplorers.default.url.replace(/\/$/, "");
  const explorerUrl = `${explorerBase}/token/${RUNTIME.contractAddress}/instance/${tokenId}`;
  const ownerLabel =
    ownerState === "loading"
      ? "READING..."
      : ownerState === "error"
        ? "UNAVAILABLE"
        : shortAddress(owner);

  return createPortal(
    <div
      className="vessel-detail-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="vessel-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vessel-detail-title"
      >
        <button
          ref={closeRef}
          className="vessel-detail-close"
          type="button"
          onClick={onClose}
          aria-label="Close Vessel detail"
        >
          ×
        </button>

        <div className="vessel-detail-media">
          <img src={ASSETS.sealedVessel} alt={`Sealed Vessel #${paddedId}`} />
        </div>

        <div className="vessel-detail-info">
          <div className="vessel-detail-kicker">NULL RITE // VESSEL RECORD</div>
          <h2 id="vessel-detail-title">VESSEL #{paddedId}</h2>
          <div className="vessel-detail-state"><i /> IDENTITY // SEALED</div>

          <div className="vessel-detail-rows">
            <div className="vessel-detail-row">
              <span>BORN RARITY</span>
              <strong>WITHHELD</strong>
            </div>
            <div className="vessel-detail-row">
              <span>OWNER</span>
              <strong title={owner ?? undefined}>{ownerLabel}</strong>
            </div>
            <div className="vessel-detail-row">
              <span>NETWORK</span>
              <strong>{RUNTIME.chain.name}</strong>
            </div>
          </div>

          {ownerState === "error" && (
            <button
              className="vessel-detail-retry"
              type="button"
              onClick={() => setReadNonce((value) => value + 1)}
            >
              READ OWNER AGAIN
            </button>
          )}

          <a
            className="btn vessel-detail-explorer"
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Explorer
          </a>

          <p className="vessel-detail-note">
            Identity, traits and Born Rarity remain withheld until The Reveal.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
