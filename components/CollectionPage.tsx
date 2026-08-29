"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { useWalletModal } from "@/components/WalletModal";
import { useRitual } from "@/components/RitualContext";
import { VesselDetailModal } from "@/components/VesselDetailModal";
import { ASSETS, IPFS, SITE } from "@/lib/siteConfig";
import { RUNTIME } from "@/lib/runtime";
import { useProtocolPhase } from "@/lib/useProtocolPhase";

const OWNERSHIP_ABI = [
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "tokenURI",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

const PAGE_SIZE = 24;
const OWNER_SCAN_CHUNK = 64;
const DIRECT_READ_CONCURRENCY = 8;
const ARTWORK_READ_CONCURRENCY = 6;

type CollectionMode = "all" | "mine";

function padTokenId(id: number) {
  return id.toString().padStart(4, "0");
}

function shortAddress(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

async function readOwnerWithRetry(publicClient: any, tokenId: number) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await publicClient.readContract({
        address: RUNTIME.contractAddress,
        abi: OWNERSHIP_ABI,
        functionName: "ownerOf",
        args: [BigInt(tokenId)],
      });
    } catch (error) {
      lastError = error;
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 180));
      }
    }
  }

  throw lastError ?? new Error(`ownerOf(${tokenId}) failed`);
}

async function readRevealedImage(publicClient: any, tokenId: number) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const tokenUriResult = await publicClient.readContract({
        address: RUNTIME.contractAddress,
        abi: OWNERSHIP_ABI,
        functionName: "tokenURI",
        args: [BigInt(tokenId)],
      });

      if (typeof tokenUriResult !== "string" || tokenUriResult.trim().length === 0) {
        throw new Error(`Invalid tokenURI(${tokenId}) response.`);
      }

      const metadataUrl = resolveResourceUri(tokenUriResult);
      const response = await fetch(metadataUrl, { cache: "force-cache" });
      if (!response.ok) {
        throw new Error(`Metadata ${tokenId} returned ${response.status}.`);
      }

      const metadata: unknown = await response.json();
      if (!isRecord(metadata) || typeof metadata.image !== "string") {
        throw new Error(`Metadata ${tokenId} has no image URI.`);
      }

      const image = metadata.image.trim();
      if (!image) {
        throw new Error(`Metadata ${tokenId} has an empty image URI.`);
      }

      return resolveResourceUri(image, metadataUrl);
    } catch (error) {
      lastError = error;
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 220));
      }
    }
  }

  throw lastError ?? new Error(`Could not resolve artwork for Vessel #${tokenId}.`);
}

export function CollectionPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: RUNTIME.chain.id });
  const { openWalletModal } = useWalletModal();
  const { open: openRitual } = useRitual();
  const phase = useProtocolPhase();
  const {
    minted,
    progress,
    summoningState,
    revealState,
    isSoldOut,
    publicMintActive,
    summoningStarted,
  } = phase;

  const [mode, setMode] = useState<CollectionMode>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [myIds, setMyIds] = useState<number[]>([]);
  const [loadingMy, setLoadingMy] = useState(false);
  const [myError, setMyError] = useState<string | null>(null);
  const [scanNonce, setScanNonce] = useState(0);
  const [selectedVesselId, setSelectedVesselId] = useState<number | null>(null);
  const [cardImages, setCardImages] = useState<Record<number, string>>({});

  const mintedCount = Math.max(0, Math.min(minted ?? 0, SITE.supply));

  const allIds = useMemo(
    () => Array.from({ length: mintedCount }, (_, index) => index + 1),
    [mintedCount]
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [mode, mintedCount]);

  useEffect(() => {
    const onModeRequest = (event: Event) => {
      const requested = (event as CustomEvent<CollectionMode>).detail;
      if (requested === "all" || requested === "mine") {
        setMode(requested);
      }
    };

    window.addEventListener("nullrite:collection-mode", onModeRequest as EventListener);
    return () =>
      window.removeEventListener("nullrite:collection-mode", onModeRequest as EventListener);
  }, []);

  useEffect(() => {
    if (mode !== "mine") return;

    if (!isConnected || !address) {
      setMyIds([]);
      setMyError(null);
      setLoadingMy(false);
      return;
    }

    if (!RUNTIME.contractConfigured) {
      setMyIds([]);
      setMyError("The Vessel contract is not configured for this environment.");
      setLoadingMy(false);
      return;
    }

    if (minted === null || !publicClient) {
      setLoadingMy(true);
      return;
    }

    if (mintedCount === 0) {
      setMyIds([]);
      setMyError(null);
      setLoadingMy(false);
      return;
    }

    let cancelled = false;

    const scanOwnedVessels = async () => {
      setLoadingMy(true);
      setMyError(null);
      setMyIds([]);
      const found: number[] = [];
      const target = address.toLowerCase();

      try {
        const rawBalance = await publicClient.readContract({
          address: RUNTIME.contractAddress,
          abi: OWNERSHIP_ABI,
          functionName: "balanceOf",
          args: [address],
        });
        const expectedBalance = Number(rawBalance);

        if (expectedBalance === 0) {
          if (!cancelled) {
            setMyIds([]);
            setLoadingMy(false);
          }
          return;
        }

        for (
          let chunkEnd = mintedCount;
          chunkEnd >= 1 && found.length < expectedBalance;
          chunkEnd -= OWNER_SCAN_CHUNK
        ) {
          if (cancelled) return;

          const chunkStart = Math.max(1, chunkEnd - OWNER_SCAN_CHUNK + 1);
          const ids = Array.from(
            { length: chunkEnd - chunkStart + 1 },
            (_, index) => chunkEnd - index
          );

          for (
            let offset = 0;
            offset < ids.length && found.length < expectedBalance;
            offset += DIRECT_READ_CONCURRENCY
          ) {
            if (cancelled) return;

            const batch = ids.slice(offset, offset + DIRECT_READ_CONCURRENCY);
            const owners = await Promise.all(
              batch.map((tokenId) => readOwnerWithRetry(publicClient, tokenId))
            );

            owners.forEach((owner, index) => {
              if (
                typeof owner === "string" &&
                owner.toLowerCase() === target
              ) {
                found.push(batch[index]);
              }
            });
          }
        }

        if (found.length !== expectedBalance) {
          throw new Error(
            `Ownership scan incomplete: expected ${expectedBalance}, found ${found.length}.`
          );
        }

        if (!cancelled) {
          setMyIds(found.sort((a, b) => a - b));
          setLoadingMy(false);
        }
      } catch {
        if (!cancelled) {
          setMyError("The Record could not be read from the chain.");
          setLoadingMy(false);
        }
      }
    };

    void scanOwnedVessels();

    return () => {
      cancelled = true;
    };
  }, [mode, isConnected, address, minted, mintedCount, publicClient, scanNonce]);

  const sourceIds = mode === "all" ? allIds : myIds;
  const displayedIds = useMemo(
    () => sourceIds.slice(0, visibleCount),
    [sourceIds, visibleCount]
  );
  const hasMore = visibleCount < sourceIds.length;
  const isRevealed = revealState === "REVEALED";

  useEffect(() => {
    if (!isRevealed) {
      setCardImages({});
      return;
    }

    if (!RUNTIME.contractConfigured || !publicClient || displayedIds.length === 0) {
      return;
    }

    let cancelled = false;

    const loadRevealedArtwork = async () => {
      for (
        let offset = 0;
        offset < displayedIds.length;
        offset += ARTWORK_READ_CONCURRENCY
      ) {
        if (cancelled) return;

        const batch = displayedIds.slice(offset, offset + ARTWORK_READ_CONCURRENCY);
        const results = await Promise.all(
          batch.map(async (tokenId) => {
            try {
              const imageUrl = await readRevealedImage(publicClient, tokenId);
              return [tokenId, imageUrl] as const;
            } catch {
              return null;
            }
          })
        );

        if (cancelled) return;

        const resolved = results.filter(
          (entry): entry is readonly [number, string] => entry !== null
        );

        if (resolved.length > 0) {
          setCardImages((current) => ({
            ...current,
            ...Object.fromEntries(resolved),
          }));
        }
      }
    };

    void loadRevealedArtwork();

    return () => {
      cancelled = true;
    };
  }, [displayedIds, isRevealed, publicClient]);

  const statusText = isSoldOut
    ? "ASSEMBLY // COMPLETE"
    : mode === "all"
      ? `SUMMONING // ${summoningState}`
      : isConnected
        ? `WALLET // ${shortAddress(address)}`
        : "WALLET // NOT CONNECTED";

  const renderEmptyState = () => {
    if (mode === "all") {
      if (!RUNTIME.contractConfigured) {
        return (
          <div className="assembly-empty">
            <div>
              <div className="eyebrow">CONTRACT // NOT CONFIGURED</div>
              <h2>The Assembly cannot be read.</h2>
              <p>No Vessel contract is configured for this environment.</p>
            </div>
          </div>
        );
      }

      if (minted === null) {
        return (
          <div className="assembly-empty">
            <div>
              <div className="eyebrow">READING THE CHAIN</div>
              <h2>The Assembly is forming.</h2>
              <p>Reading the current Vessel count from the contract.</p>
            </div>
          </div>
        );
      }

      if (mintedCount === 0) {
        return (
          <div className="assembly-empty">
            <div>
              <div className="eyebrow">
                {publicMintActive
                  ? "THE ASSEMBLY // AWAITING FIRST ANSWER"
                  : "THE ASSEMBLY // SUMMONING PAUSED"}
              </div>
              <h2>No Vessel has answered yet.</h2>
              <p>
                {publicMintActive
                  ? "The first summoned Vessel will appear here in its sealed state."
                  : summoningStarted
                    ? "Public Summoning has started but is currently paused by the contract. The Assembly remains live."
                    : "Public Summoning has not begun."}
              </p>
              {publicMintActive && (
                <button className="btn primary" onClick={openRitual}>
                  Summon a Vessel
                </button>
              )}
            </div>
          </div>
        );
      }
    }

    if (mode === "mine" && !isConnected) {
      return (
        <div className="assembly-empty">
          <div>
            <div className="eyebrow">MY VESSELS // LOCKED</div>
            <h2>Identify yourself.</h2>
            <p>Connect a wallet to read the Vessels currently held by that address.</p>
            <button className="btn primary" onClick={openWalletModal}>
              Connect Wallet
            </button>
          </div>
        </div>
      );
    }

    if (mode === "mine" && loadingMy) {
      return (
        <div className="assembly-empty">
          <div>
            <div className="eyebrow">MY VESSELS // READING THE RECORD</div>
            <h2>Finding your Vessels.</h2>
            <p>Ownership is being read directly from the Vessel contract.</p>
          </div>
        </div>
      );
    }

    if (mode === "mine" && myError) {
      return (
        <div className="assembly-empty">
          <div>
            <div className="eyebrow">MY VESSELS // READ ERROR</div>
            <h2>The Record is silent.</h2>
            <p>{myError}</p>
            <button className="btn" onClick={() => setScanNonce((value) => value + 1)}>
              Read Again
            </button>
          </div>
        </div>
      );
    }

    if (mode === "mine" && isConnected && myIds.length === 0) {
      return (
        <div className="assembly-empty">
          <div>
            <div className="eyebrow">MY VESSELS // NONE FOUND</div>
            <h2>No Vessel has answered you.</h2>
            <p>This wallet does not currently hold a Vessel from the Assembly.</p>
            {publicMintActive && !isSoldOut ? (
              <button className="btn primary" onClick={openRitual}>
                Begin the Rite
              </button>
            ) : (
              <button className="btn" onClick={() => setMode("all")}>
                View the Assembly
              </button>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <section className="route-page" id="collectionPage" aria-hidden="true">
      <div className="route-inner collection-route-inner">
        <div className="route-topline">
          <div className="route-code">
            NULL RITE // COLLECTION // {isSoldOut ? "ASSEMBLY COMPLETE" : "THE ASSEMBLY"}
          </div>
          <button className="route-back" data-close-page>
            ← Return Home
          </button>
        </div>

        <div className="collection-live-head">
          <div className="collection-live-copy">
            <div className="eyebrow">
              {isSoldOut ? "THE ASSEMBLY // COMPLETE" : `THE ASSEMBLY // ${summoningState}`}
            </div>
            <h1 className="route-title">
              {isSoldOut ? "THE ASSEMBLY IS COMPLETE." : "THE ASSEMBLY"}
            </h1>
            <div className="collection-live-count">
              <strong>
                {minted === null ? "—" : mintedCount} / {SITE.supply}
              </strong>
              <span>
                {isSoldOut
                  ? "3232 VESSELS HAVE ANSWERED."
                  : mintedCount === 1
                    ? "VESSEL HAS ANSWERED."
                    : "VESSELS HAVE ANSWERED."}
              </span>
            </div>
            <p className="route-sub">
              {isSoldOut
                ? `Public Summoning is complete. Every Vessel identity is recorded onchain. The Assembly remains available while The Reveal is ${revealState.toLowerCase()}.`
                : "Every Vessel shown here has been summoned onchain. Until Reveal, identities remain sealed; the Assembly records which Vessels exist, while My Vessels isolates the ones held by the connected wallet."}
            </p>
          </div>

          <div className="collection-meter">
            <div className="collection-meter-top">
              <span>Assembly Progress</span>
              <strong>
                {minted === null ? "—" : `${mintedCount} / ${SITE.supply}`}
              </strong>
            </div>
            <div className="progress collection-progress">
              <i style={{ width: `${progress}%` }} />
            </div>
            <div className="collection-meter-meta">
              <div>
                <span>Summoning</span>
                <strong>{summoningState}</strong>
              </div>
              <div>
                <span>Reveal</span>
                <strong>{revealState}</strong>
              </div>
            </div>
          </div>
        </div>

        {isSoldOut && (
          <div
            className="actions"
            style={{ justifyContent: "center", marginBottom: 28 }}
          >
            <button className="btn primary" onClick={() => setMode("all")}>
              View the Assembly
            </button>
            <button
              className="btn"
              type="button"
              disabled={revealState !== "REVEALED"}
            >
              {revealState === "REVEALED" ? "The Reveal Is Live" : "Await the Reveal"}
            </button>
          </div>
        )}

        <div className="collection-toolbar">
          <div className="collection-tabs" role="tablist" aria-label="Collection view">
            <button
              className={`collection-tab ${mode === "all" ? "active" : ""}`}
              type="button"
              role="tab"
              aria-selected={mode === "all"}
              onClick={() => setMode("all")}
            >
              All Vessels
              <span>{minted === null ? "—" : mintedCount}</span>
            </button>
            <button
              className={`collection-tab ${mode === "mine" ? "active" : ""}`}
              type="button"
              role="tab"
              aria-selected={mode === "mine"}
              onClick={() => setMode("mine")}
            >
              My Vessels
              <span>{!isConnected ? "—" : loadingMy ? "…" : myIds.length}</span>
            </button>
          </div>
          <div className="collection-mode-status">{statusText}</div>
        </div>

        {displayedIds.length > 0 ? (
          <>
            <div className="assembly-grid">
              {displayedIds.map((id) => {
                const imageSrc = isRevealed
                  ? cardImages[id] ?? ASSETS.sealedVessel
                  : ASSETS.sealedVessel;

                return (
                  <button
                    className="assembly-card assembly-card-button"
                    key={id}
                    type="button"
                    onClick={() => setSelectedVesselId(id)}
                    aria-label={`View Vessel #${padTokenId(id)}`}
                  >
                    <div className="assembly-card-media">
                      <img
                        src={imageSrc}
                        alt={`${isRevealed ? "Revealed" : "Sealed"} Vessel #${padTokenId(id)}`}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="assembly-card-info">
                      <strong>VESSEL #{padTokenId(id)}</strong>
                      <span>IDENTITY // {isRevealed ? "REVEALED" : "SEALED"}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {hasMore && (
              <div className="collection-load">
                <button
                  className="btn"
                  onClick={() => setVisibleCount((value) => value + PAGE_SIZE)}
                >
                  Load More
                </button>
              </div>
            )}
          </>
        ) : (
          renderEmptyState()
        )}
      </div>

      <VesselDetailModal
        tokenId={selectedVesselId}
        onClose={() => setSelectedVesselId(null)}
      />
    </section>
  );
}
