"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePublicClient, useReadContract } from "wagmi";
import { ASSETS, IPFS } from "@/lib/siteConfig";
import { RUNTIME } from "@/lib/runtime";

const VESSEL_VIEW_ABI = [
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "revealed",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "tokenURI",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

type VesselDetailModalProps = {
  tokenId: number | null;
  onClose: () => void;
};

type ReadState = "idle" | "loading" | "ready" | "error";

type MetadataTrait = {
  traitType: string;
  value: string;
};

type ParsedMetadata = {
  imageUrl: string | null;
  rarity: string | null;
  traits: MetadataTrait[];
};

function padTokenId(id: number) {
  return id.toString().padStart(4, "0");
}

function shortAddress(address?: string | null) {
  if (!address) return "—";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function scalarToString(value: unknown) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return null;
}

function normalizeTraitName(value: string) {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, " ");
}

function resolveResourceUri(uri: string, baseUrl?: string) {
  const trimmed = uri.trim();

  if (trimmed.startsWith("ipfs://")) {
    const path = trimmed.slice("ipfs://".length).replace(/^ipfs\//i, "");
    const gateway = IPFS.gateway.replace(/\/$/, "");
    return `${gateway}/${path}`;
  }

  if (trimmed.startsWith("ar://")) {
    return `https://arweave.net/${trimmed.slice("ar://".length)}`;
  }

  if (/^(https?:|data:)/i.test(trimmed)) {
    return trimmed;
  }

  if (baseUrl) {
    try {
      return new URL(trimmed, baseUrl).toString();
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

function parseMetadata(raw: unknown, metadataUrl: string): ParsedMetadata {
  if (!isRecord(raw)) {
    throw new Error("Metadata root is not an object.");
  }

  const attributes = Array.isArray(raw.attributes)
    ? raw.attributes.flatMap((entry): MetadataTrait[] => {
        if (!isRecord(entry)) return [];
        const traitType = scalarToString(entry.trait_type);
        const value = scalarToString(entry.value);
        if (!traitType || !value) return [];
        return [{ traitType, value }];
      })
    : [];

  const topLevelRarity = scalarToString(raw.rarity);
  const bornRarityAttribute = attributes.find(
    (attribute) => normalizeTraitName(attribute.traitType) === "born rarity"
  );
  const genericRarityAttribute = attributes.find(
    (attribute) => normalizeTraitName(attribute.traitType) === "rarity"
  );

  const rarity =
    topLevelRarity ??
    bornRarityAttribute?.value ??
    genericRarityAttribute?.value ??
    null;

  const traits = attributes.filter((attribute) => {
    const normalized = normalizeTraitName(attribute.traitType);
    return normalized !== "born rarity" && normalized !== "rarity";
  });

  const image = scalarToString(raw.image);

  return {
    imageUrl: image ? resolveResourceUri(image, metadataUrl) : null,
    rarity,
    traits,
  };
}

export function VesselDetailModal({ tokenId, onClose }: VesselDetailModalProps) {
  const publicClient = usePublicClient({ chainId: RUNTIME.chain.id });
  const revealRead = useReadContract({
    address: RUNTIME.contractAddress,
    abi: VESSEL_VIEW_ABI,
    functionName: "revealed",
    chainId: RUNTIME.chain.id,
    query: {
      enabled: tokenId !== null && RUNTIME.contractConfigured,
      refetchInterval: 8_000,
    },
  });

  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [owner, setOwner] = useState<string | null>(null);
  const [ownerState, setOwnerState] = useState<ReadState>("idle");
  const [ownerReadNonce, setOwnerReadNonce] = useState(0);
  const [metadata, setMetadata] = useState<ParsedMetadata | null>(null);
  const [metadataState, setMetadataState] = useState<ReadState>("idle");
  const [metadataReadNonce, setMetadataReadNonce] = useState(0);
  const [traitsOpen, setTraitsOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const revealed = revealRead.data === true;

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
    setTraitsOpen(false);
    setImageFailed(false);
  }, [tokenId, revealed]);

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
              abi: VESSEL_VIEW_ABI,
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
  }, [tokenId, publicClient, ownerReadNonce]);

  useEffect(() => {
    if (tokenId === null || !revealed) {
      setMetadata(null);
      setMetadataState("idle");
      return;
    }

    if (!RUNTIME.contractConfigured || !publicClient) {
      setMetadata(null);
      setMetadataState("error");
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    const readMetadata = async () => {
      setMetadata(null);
      setMetadataState("loading");

      try {
        let tokenUriResult: unknown;
        let tokenUriError: unknown;

        for (let attempt = 0; attempt < 2; attempt += 1) {
          try {
            tokenUriResult = await publicClient.readContract({
              address: RUNTIME.contractAddress,
              abi: VESSEL_VIEW_ABI,
              functionName: "tokenURI",
              args: [BigInt(tokenId)],
            });
            tokenUriError = undefined;
            break;
          } catch (error) {
            tokenUriError = error;
            if (attempt === 0) {
              await new Promise((resolve) => setTimeout(resolve, 180));
            }
          }
        }

        if (
          tokenUriError ||
          typeof tokenUriResult !== "string" ||
          tokenUriResult.trim().length === 0
        ) {
          throw tokenUriError ?? new Error("Invalid tokenURI response");
        }

        const metadataUrl = resolveResourceUri(tokenUriResult);
        let response: Response | null = null;
        let fetchError: unknown;

        for (let attempt = 0; attempt < 2; attempt += 1) {
          try {
            const nextResponse = await fetch(metadataUrl, {
              cache: "no-store",
              signal: controller.signal,
            });
            if (!nextResponse.ok) {
              throw new Error(`Metadata request failed with ${nextResponse.status}.`);
            }
            response = nextResponse;
            fetchError = undefined;
            break;
          } catch (error) {
            fetchError = error;
            if (attempt === 0 && !controller.signal.aborted) {
              await new Promise((resolve) => setTimeout(resolve, 220));
            }
          }
        }

        if (!response) {
          throw fetchError ?? new Error("Metadata request failed.");
        }

        const rawMetadata: unknown = await response.json();
        const parsedMetadata = parseMetadata(rawMetadata, metadataUrl);

        if (!cancelled) {
          setMetadata(parsedMetadata);
          setMetadataState("ready");
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        if (!cancelled) {
          setMetadata(null);
          setMetadataState("error");
        }
      }
    };

    void readMetadata();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [tokenId, revealed, publicClient, metadataReadNonce]);

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

  const rarityLabel = !revealed
    ? "WITHHELD"
    : metadataState === "loading"
      ? "READING..."
      : metadataState === "error"
        ? "UNAVAILABLE"
        : metadata?.rarity ?? "UNAVAILABLE";

  const traits = revealed && metadataState === "ready" ? metadata?.traits ?? [] : [];
  const hasRevealedImage = Boolean(
    revealed &&
    metadataState === "ready" &&
    metadata?.imageUrl &&
    !imageFailed
  );
  const imageSrc = hasRevealedImage ? metadata?.imageUrl ?? ASSETS.sealedVessel : ASSETS.sealedVessel;
  const mediaStatus =
    revealed && metadataState === "error"
      ? "METADATA // UNAVAILABLE"
      : revealed && metadataState === "ready" && !hasRevealedImage
        ? "ARTWORK // UNAVAILABLE"
        : null;

  const note = !revealed
    ? "Identity, traits and Born Rarity remain withheld until The Reveal."
    : metadataState === "loading"
      ? "The Reveal is onchain. Reading this Vessel's metadata."
      : metadataState === "error"
        ? "The Reveal is onchain, but this Vessel's metadata could not be read."
        : "Born Rarity and traits are read directly from this Vessel's revealed metadata.";

  return createPortal(
    <>
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

          <div className={`vessel-detail-media ${hasRevealedImage ? "is-revealed" : ""}`}>
            <img
              key={imageSrc}
              src={imageSrc}
              alt={`${revealed ? "Revealed" : "Sealed"} Vessel #${paddedId}`}
              onError={() => {
                if (hasRevealedImage) setImageFailed(true);
              }}
            />
            {mediaStatus && <span className="vessel-detail-media-status">{mediaStatus}</span>}
          </div>

          <div className="vessel-detail-info">
            <div className="vessel-detail-kicker">NULL RITE // VESSEL RECORD</div>
            <h2 id="vessel-detail-title">VESSEL #{paddedId}</h2>
            <div className={`vessel-detail-state ${revealed ? "is-revealed" : ""}`}>
              <i /> IDENTITY // {revealed ? "REVEALED" : "SEALED"}
            </div>

            <div className="vessel-detail-rows">
              <div className="vessel-detail-row">
                <span>BORN RARITY</span>
                <strong className="vessel-detail-rarity">{rarityLabel}</strong>
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

            <div className="vessel-detail-read-actions">
              {ownerState === "error" && (
                <button
                  className="vessel-detail-retry"
                  type="button"
                  onClick={() => setOwnerReadNonce((value) => value + 1)}
                >
                  READ OWNER AGAIN
                </button>
              )}
              {revealed && metadataState === "error" && (
                <button
                  className="vessel-detail-retry"
                  type="button"
                  onClick={() => setMetadataReadNonce((value) => value + 1)}
                >
                  READ METADATA AGAIN
                </button>
              )}
            </div>

            {revealed && metadataState === "ready" && traits.length > 0 && (
              <>
                <button
                  className="vessel-detail-traits-toggle"
                  type="button"
                  aria-expanded={traitsOpen}
                  onClick={() => setTraitsOpen((value) => !value)}
                >
                  <span>VIEW TRAITS ({traits.length})</span>
                  <strong>{traitsOpen ? "−" : "+"}</strong>
                </button>

                {traitsOpen && (
                  <div className="vessel-detail-traits">
                    {traits.map((trait, index) => (
                      <div className="vessel-detail-trait" key={`${trait.traitType}-${trait.value}-${index}`}>
                        <span>{trait.traitType}</span>
                        <strong>{trait.value}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <a
              className="btn vessel-detail-explorer"
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Explorer
            </a>

            <p className="vessel-detail-note">{note}</p>
          </div>
        </div>
      </div>

      <style>{`
        .vessel-detail-media.is-revealed img{
          opacity:1;
          filter:none;
        }
        .vessel-detail-media-status{
          position:absolute;
          left:14px;
          bottom:14px;
          z-index:1;
          padding:8px 10px;
          border:1px solid rgba(255,255,255,.1);
          background:rgba(5,6,7,.82);
          color:#778186;
          font-family:ui-monospace,SFMono-Regular,Consolas,monospace;
          font-size:6px;
          letter-spacing:.14em;
          text-transform:uppercase;
        }
        .vessel-detail-state.is-revealed{
          color:#aeb6b9;
        }
        .vessel-detail-rarity{
          text-transform:uppercase;
        }
        .vessel-detail-read-actions{
          display:flex;
          justify-content:flex-end;
          gap:14px;
          flex-wrap:wrap;
        }
        .vessel-detail-traits-toggle{
          width:100%;
          min-height:38px;
          margin-top:16px;
          padding:0;
          border:0;
          border-bottom:1px solid var(--line);
          background:transparent;
          color:#949da1;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:18px;
          font-family:ui-monospace,SFMono-Regular,Consolas,monospace;
          font-size:7px;
          letter-spacing:.15em;
          text-transform:uppercase;
          cursor:pointer;
        }
        .vessel-detail-traits-toggle:hover,
        .vessel-detail-traits-toggle:focus-visible{
          color:#fff;
          outline:none;
        }
        .vessel-detail-traits-toggle strong{
          font-size:15px;
          font-weight:400;
        }
        .vessel-detail-traits{
          max-height:166px;
          overflow:auto;
          border-bottom:1px solid var(--line);
        }
        .vessel-detail-trait{
          min-height:36px;
          display:grid;
          grid-template-columns:.9fr minmax(0,1.1fr);
          gap:16px;
          align-items:center;
          border-bottom:1px solid rgba(255,255,255,.045);
        }
        .vessel-detail-trait:last-child{
          border-bottom:0;
        }
        .vessel-detail-trait span,
        .vessel-detail-trait strong{
          min-width:0;
          font-family:ui-monospace,SFMono-Regular,Consolas,monospace;
          font-size:7px;
          line-height:1.35;
          text-transform:uppercase;
        }
        .vessel-detail-trait span{
          color:#606a6f;
          letter-spacing:.12em;
        }
        .vessel-detail-trait strong{
          color:#aeb5b8;
          font-weight:500;
          text-align:right;
          overflow-wrap:anywhere;
        }
        @media(max-width:760px){
          .vessel-detail-read-actions{
            gap:10px;
          }
          .vessel-detail-traits{
            max-height:150px;
          }
          .vessel-detail-trait{
            min-height:34px;
          }
        }
      `}</style>
    </>,
    document.body
  );
}
