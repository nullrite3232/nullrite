"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useRitual } from "@/components/RitualContext";
import { RH_TESTNET_CHAIN } from "@/lib/chain";
import { ASSETS, SITE } from "@/lib/siteConfig";
import { useAssemblySupply } from "@/lib/useAssemblySupply";

const OWNER_OF_ABI = [
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

const PAGE_SIZE = 24;
const OWNER_SCAN_CHUNK = 128;

type CollectionMode = "all" | "mine";

function padTokenId(id: number) {
  return id.toString().padStart(4, "0");
}

function shortAddress(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function CollectionPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: RH_TESTNET_CHAIN.id });
  const { openConnectModal } = useConnectModal() ?? {};
  const { open: openRitual } = useRitual();
  const { minted, progress } = useAssemblySupply();

  const [mode, setMode] = useState<CollectionMode>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [myIds, setMyIds] = useState<number[]>([]);
  const [loadingMy, setLoadingMy] = useState(false);
  const [myError, setMyError] = useState<string | null>(null);
  const [scanNonce, setScanNonce] = useState(0);

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
        for (let start = 1; start <= mintedCount; start += OWNER_SCAN_CHUNK) {
          if (cancelled) return;

          const end = Math.min(mintedCount, start + OWNER_SCAN_CHUNK - 1);
          const ids = Array.from({ length: end - start + 1 }, (_, index) => start + index);
          const contracts = ids.map((tokenId) => ({
            address: SITE.contractAddress as `0x${string}`,
            abi: OWNER_OF_ABI,
            functionName: "ownerOf" as const,
            args: [BigInt(tokenId)] as const,
          }));

          const results = await publicClient.multicall({
            allowFailure: true,
            contracts,
          });

          results.forEach((result: any, index) => {
            if (
              result?.status === "success" &&
              typeof result.result === "string" &&
              result.result.toLowerCase() === target
            ) {
              found.push(ids[index]);
            }
          });
        }

        if (!cancelled) {
          setMyIds(found);
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
  const displayedIds = sourceIds.slice(0, visibleCount);
  const hasMore = visibleCount < sourceIds.length;

  const statusText =
    mode === "all"
      ? "CHAIN // LIVE ASSEMBLY"
      : isConnected
        ? `WALLET // ${shortAddress(address)}`
        : "WALLET // NOT CONNECTED";

  const renderEmptyState = () => {
    if (mode === "all") {
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
              <div className="eyebrow">THE ASSEMBLY // EMPTY</div>
              <h2>No Vessel has answered yet.</h2>
              <p>The first summoned Vessel will appear here in its sealed state.</p>
              <button className="btn primary" onClick={openRitual}>
                Summon a Vessel
              </button>
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
            <button className="btn primary" onClick={() => openConnectModal?.()}>
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
            <button className="btn primary" onClick={openRitual}>
              Begin the Rite
            </button>
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
          <div className="route-code">NULL RITE // COLLECTION // THE ASSEMBLY</div>
          <button className="route-back" data-close-page>
            ← Return Home
          </button>
        </div>

        <div className="collection-live-head">
          <div className="collection-live-copy">
            <div className="eyebrow">THE ASSEMBLY</div>
            <h1 className="route-title">THE ASSEMBLY</h1>
            <div className="collection-live-count">
              <strong>{minted === null ? "—" : mintedCount.toLocaleString()} / {SITE.supply.toLocaleString()}</strong>
              <span>{mintedCount === 1 ? "VESSEL HAS ANSWERED." : "VESSELS HAVE ANSWERED."}</span>
            </div>
            <p className="route-sub">
              Every Vessel shown here has been summoned onchain. Until Reveal,
              identities remain sealed; the Assembly records which Vessels exist,
              while My Vessels isolates the ones held by the connected wallet.
            </p>
          </div>

          <div className="collection-meter">
            <div className="collection-meter-top">
              <span>Assembly Progress</span>
              <strong>{minted === null ? "—" : `${mintedCount.toLocaleString()} / ${SITE.supply.toLocaleString()}`}</strong>
            </div>
            <div className="progress collection-progress">
              <i style={{ width: `${progress}%` }} />
            </div>
            <div className="collection-meter-meta">
              <div><span>Reveal</span><strong>SEALED</strong></div>
              <div><span>Artwork</span><strong>WITHHELD</strong></div>
            </div>
          </div>
        </div>

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
              <span>{minted === null ? "—" : mintedCount.toLocaleString()}</span>
            </button>
            <button
              className={`collection-tab ${mode === "mine" ? "active" : ""}`}
              type="button"
              role="tab"
              aria-selected={mode === "mine"}
              onClick={() => setMode("mine")}
            >
              My Vessels
              <span>{!isConnected ? "—" : loadingMy ? "…" : myIds.length.toLocaleString()}</span>
            </button>
          </div>
          <div className="collection-mode-status">{statusText}</div>
        </div>

        {displayedIds.length > 0 ? (
          <>
            <div className="assembly-grid">
              {displayedIds.map((id) => (
                <article className="assembly-card" key={id}>
                  <div className="assembly-card-media">
                    <img src={ASSETS.sealedVessel} alt={`Sealed Vessel #${padTokenId(id)}`} />
                  </div>
                  <div className="assembly-card-info">
                    <strong>VESSEL #{padTokenId(id)}</strong>
                    <span>IDENTITY // SEALED</span>
                  </div>
                </article>
              ))}
            </div>

            {hasMore && (
              <div className="collection-load">
                <button className="btn" onClick={() => setVisibleCount((value) => value + PAGE_SIZE)}>
                  Load More
                </button>
              </div>
            )}
          </>
        ) : (
          renderEmptyState()
        )}
      </div>
    </section>
  );
}
