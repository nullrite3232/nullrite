"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatEther, parseEventLogs, zeroAddress } from "viem";
import { useWalletModal } from "@/components/WalletModal";
import { ASSETS, SITE } from "@/lib/siteConfig";
import { RUNTIME, transactionExplorerUrl } from "@/lib/runtime";
import { useAssemblySupply } from "@/lib/useAssemblySupply";
import {
  useMintContractState,
  VESSEL_MINT_ABI,
} from "@/lib/useMintContractState";

const TRANSFER_ABI = [
  {
    type: "event",
    name: "Transfer",
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" },
    ],
  },
] as const;

type Stage = "config" | "signature" | "chain" | "success";

const STAGE_LABEL: Record<Stage, string> = {
  config: "THE SUMMONING",
  signature: "AWAITING SIGNATURE",
  chain: "AWAITING THE CHAIN",
  success: "VESSEL ANSWERED",
};

function friendlyTxError(message?: string) {
  if (!message) return "Transaction failed.";
  const lower = message.toLowerCase();
  if (lower.includes("user rejected") || lower.includes("user denied")) {
    return "The transaction was rejected in the wallet.";
  }
  if (lower.includes("insufficient funds")) {
    return "Insufficient ETH for this summoning.";
  }
  if (
    lower.includes("chain mismatch") ||
    lower.includes("does not match the target chain") ||
    lower.includes("network switch was not confirmed")
  ) {
    return `Switch the connected wallet to ${RUNTIME.chain.name} (chain ${RUNTIME.chain.id}) and try again.`;
  }
  if (
    lower.includes("mint inactive") ||
    lower.includes("mint is not active") ||
    lower.includes("public mint")
  ) {
    return "The Summoning is currently sealed by the contract.";
  }
  if (lower.includes("wallet") && lower.includes("limit")) {
    return "This wallet has reached its onchain summoning limit.";
  }
  if (lower.includes("sold out")) {
    return "The Assembly is complete.";
  }
  if (lower.includes("exceeds") || lower.includes("max")) {
    return "The contract rejected this quantity. Check the wallet allowance or per-summoning limit.";
  }
  return message.split("\n")[0] || "Transaction failed.";
}

function normalizeChainId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") {
    const parsed = value.startsWith("0x")
      ? Number.parseInt(value.slice(2), 16)
      : Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

async function waitForWalletChain(connector: any, expectedChainId: number) {
  const deadline = Date.now() + 5_000;
  let lastSeen: number | null = null;

  while (Date.now() < deadline) {
    try {
      const connectorChainId = normalizeChainId(await connector?.getChainId?.());
      if (connectorChainId !== null) lastSeen = connectorChainId;
      if (connectorChainId === expectedChainId) return;
    } catch {
      // Fall through to the raw provider check.
    }

    try {
      const provider = await connector?.getProvider?.();
      const rawChainId = await provider?.request?.({ method: "eth_chainId" });
      const providerChainId = normalizeChainId(rawChainId);
      if (providerChainId !== null) lastSeen = providerChainId;
      if (providerChainId === expectedChainId) return;
    } catch {
      // Retry briefly because some injected wallets update asynchronously.
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  throw new Error(
    `Wallet network switch was not confirmed. Current chain: ${lastSeen ?? "unknown"}; required chain: ${expectedChainId}.`
  );
}

export function RitualOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { openWalletModal } = useWalletModal();
  const { switchChainAsync } = useSwitchChain();
  const {
    writeContractAsync,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();
  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });
  const { minted, remaining, refetch: refetchSupply } = useAssemblySupply();

  const {
    mintPriceWei,
    maxPerTx,
    maxPerWallet,
    publicMintActive,
    contractStateSynced,
    isContractStateLoading,
    walletAllowance,
    isAllowanceLoading,
  } = useMintContractState({
    address,
    enabled: open,
    remaining,
  });

  const [stage, setStage] = useState<Stage>("config");
  const [qty, setQty] = useState(1);
  const [ids, setIds] = useState<string[]>([]);
  const [txError, setTxError] = useState<string | null>(null);
  const qtyElRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setStage("config");
      setQty(1);
      setIds([]);
      setTxError(null);
      reset();
      void refetchSupply();
    }
  }, [open, reset, refetchSupply]);

  const maxSelectable = useMemo(() => {
    if (!publicMintActive) return 0;
    const supplyCap =
      remaining === null ? maxPerTx : Math.max(0, Math.min(maxPerTx, remaining));
    if (walletAllowance === null) return supplyCap;
    return Math.max(0, Math.min(supplyCap, walletAllowance));
  }, [maxPerTx, publicMintActive, remaining, walletAllowance]);

  useEffect(() => {
    if (maxSelectable > 0 && qty > maxSelectable) {
      setQty(maxSelectable);
    }
  }, [maxSelectable, qty]);

  const cost = useMemo(
    () => formatEther(mintPriceWei * BigInt(qty)),
    [mintPriceWei, qty]
  );

  useEffect(() => {
    if (hash) setStage("chain");
  }, [hash]);

  useEffect(() => {
    if (writeError && !hash) {
      setTxError(friendlyTxError(writeError.message));
      setStage("config");
    }
  }, [writeError, hash]);

  useEffect(() => {
    if (receiptError) {
      setTxError(friendlyTxError(receiptError.message));
      setStage("config");
    }
  }, [receiptError]);

  useEffect(() => {
    if (!isConfirmed || !receipt) return;

    let mintedIds: string[] = [];
    try {
      const transfers = parseEventLogs({
        abi: TRANSFER_ABI,
        logs: receipt.logs,
        eventName: "Transfer",
        strict: false,
      });

      mintedIds = transfers
        .filter((event) => {
          const from = event.args.from?.toLowerCase();
          const to = event.args.to?.toLowerCase();
          return (
            from === zeroAddress.toLowerCase() &&
            (!address || to === address.toLowerCase())
          );
        })
        .map((event) => `VESSEL #${event.args.tokenId?.toString()}`)
        .filter((value) => !value.endsWith("undefined"));
    } catch {
      mintedIds = [];
    }

    setIds(mintedIds);
    setStage("success");
    void refetchSupply();
  }, [isConfirmed, receipt, address, refetchSupply]);

  const setQtySafe = (n: number) => {
    const ceiling = maxSelectable > 0 ? maxSelectable : maxPerTx;
    const next = Math.max(1, Math.min(ceiling, n));
    setQty(next);
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

  const begin = async () => {
    setTxError(null);

    if (!isConnected) {
      openWalletModal();
      return;
    }

    if (!RUNTIME.contractConfigured) {
      setTxError("The Vessel contract is not configured for this environment.");
      return;
    }

    if (isContractStateLoading) {
      setTxError("Reading the live Summoning state from the contract.");
      return;
    }

    if (!contractStateSynced) {
      setTxError("The live Summoning state could not be verified. No transaction was sent.");
      return;
    }

    if (remaining === 0) {
      setTxError("The Assembly is complete.");
      return;
    }

    if (!publicMintActive) {
      setTxError("The Summoning is currently sealed by the contract.");
      return;
    }

    if (isAllowanceLoading) {
      setTxError("Checking this wallet against the live contract. Try again in a moment.");
      return;
    }

    if (walletAllowance === 0) {
      setTxError("This wallet has reached its onchain summoning limit.");
      return;
    }

    if (maxSelectable > 0 && qty > maxSelectable) {
      setTxError(`This wallet can summon up to ${maxSelectable} more in this transaction.`);
      setQty(maxSelectable);
      return;
    }

    try {
      if (chainId !== RUNTIME.chain.id) {
        await switchChainAsync({ chainId: RUNTIME.chain.id });
        await waitForWalletChain(connector, RUNTIME.chain.id);
      } else {
        await waitForWalletChain(connector, RUNTIME.chain.id);
      }

      setStage("signature");
      await writeContractAsync({
        address: RUNTIME.contractAddress,
        abi: VESSEL_MINT_ABI,
        functionName: "mint",
        args: [BigInt(qty)],
        value: mintPriceWei * BigInt(qty),
        chainId: RUNTIME.chain.id,
      });
    } catch (error: any) {
      setTxError(friendlyTxError(error?.shortMessage ?? error?.message));
      setStage("config");
    }
  };

  const close = () => {
    onClose();
    setTimeout(() => setStage("config"), 180);
  };

  if (!open) return null;

  const plural = qty > 1;
  const successHeading = plural
    ? `${qty} Vessels have answered.`
    : "A Vessel has answered.";
  const successCopy = plural
    ? "Their final forms remain sealed. The Reveal event will expose each born artwork, traits, and rarity later."
    : "Its final form remains sealed. The Reveal event will expose its born artwork, traits, and rarity later.";

  const allowanceLabel = !publicMintActive
    ? "SUMMONING SEALED"
    : !isConnected
      ? "CONNECT TO CHECK"
      : isAllowanceLoading
        ? "CHECKING"
        : walletAllowance === null
          ? "CONTRACT WILL VERIFY"
          : walletAllowance === 0
            ? "LIMIT REACHED"
            : `${walletAllowance} REMAINING`;

  const beginLabel = !RUNTIME.contractConfigured
    ? "CONTRACT NOT CONFIGURED"
    : isContractStateLoading
      ? "SYNCING CONTRACT"
      : !contractStateSynced
        ? "CONTRACT UNAVAILABLE"
        : !publicMintActive
          ? "SUMMONING SEALED"
          : remaining === 0
            ? "ASSEMBLY COMPLETE"
            : walletAllowance === 0
              ? "WALLET LIMIT REACHED"
              : isAllowanceLoading
                ? "CHECKING WALLET"
                : isPending
                  ? "AWAITING SIGNATURE"
                  : `SUMMON ${qty} ${plural ? "VESSELS" : "VESSEL"}`;

  const beginDisabled =
    !RUNTIME.contractConfigured ||
    !contractStateSynced ||
    isPending ||
    isConfirming ||
    isContractStateLoading ||
    isAllowanceLoading ||
    remaining === 0 ||
    !publicMintActive ||
    walletAllowance === 0;

  return (
    <div className="ritual-overlay show" id="ritualOverlay">
      <div className="ritual-shell">
        <div className="ritual-panel">
          <div className="ritual-topbar">
            <div className="ritual-stage-tag" id="ritualStageTag">
              {STAGE_LABEL[stage]}
            </div>
            <button className="ritual-close" id="ritualClose" onClick={close} aria-label="Close summoning">×</button>
          </div>

          <section className={`ritual-view ritual-config ${stage === "config" ? "active" : ""}`} id="viewConfig">
            <div className="ritual-visual">
              <img src={ASSETS.sealedVessel} alt="Sealed Vessel" />
            </div>
            <div className="ritual-copy">
              <div className="eyebrow">THE SUMMONING</div>
              <h2>Call a Vessel.</h2>
              <p>
                Something beyond the Gate is listening. Summon up to {maxPerTx} Vessels per transaction
                and up to {maxPerWallet} per wallet. Their final identities remain sealed until reveal.
              </p>

              <div className="ritual-qty-wrap">
                <div className="ritual-label">Select how many will answer</div>
                <div className="summon-counter">
                  <button className="counter-btn" id="qtyMinus" aria-label="Decrease quantity" disabled={qty <= 1 || isPending || isConfirming || isAllowanceLoading} onClick={() => setQtySafe(qty - 1)}>−</button>
                  <div className="counter-center">
                    <div className="counter-value" id="ritualQty" ref={qtyElRef}>{qty}</div>
                    <div className="counter-caption">{plural ? "VESSELS" : "VESSEL"}</div>
                  </div>
                  <button className="counter-btn" id="qtyPlus" aria-label="Increase quantity" disabled={maxSelectable === 0 || qty >= maxSelectable || isPending || isConfirming || isAllowanceLoading} onClick={() => setQtySafe(qty + 1)}>+</button>
                </div>
                <div className="counter-meta">
                  <span>MIN / 1</span>
                  <span>MAX / {maxPerTx} PER SUMMONING</span>
                </div>
              </div>

              <div className="ritual-data">
                <div className="ritual-row"><span>Summoning Cost</span><span id="sumCost">{cost} ETH</span></div>
                <div className="ritual-row"><span>Network</span><span>{RUNTIME.chain.name}</span></div>
                <div className="ritual-row"><span>Wallet Network</span><span>{!isConnected ? "NOT CONNECTED" : chainId === RUNTIME.chain.id ? "READY" : `SWITCH REQUIRED // CHAIN ${chainId}`}</span></div>
                <div className="ritual-row"><span>Summoning State</span><span>{publicMintActive ? "OPEN" : "SEALED"}</span></div>
                <div className="ritual-row"><span>Wallet Allowance</span><span>{allowanceLabel}</span></div>
                <div className="ritual-row"><span>Contract Rules</span><span>{contractStateSynced ? "ONCHAIN // LIVE" : isContractStateLoading ? "SYNCING" : "UNAVAILABLE"}</span></div>
                <div className="ritual-row"><span>Reveal State</span><span>SEALED</span></div>
                <div className="ritual-row">
                  <span>Vessels Summoned</span>
                  <span>{minted === null ? "—" : minted} / {SITE.supply}</span>
                </div>
              </div>

              {txError && <div className="ritual-error">{txError}</div>}

              <div className="ritual-actions">
                <button className="btn" id="ritualCancel" onClick={close}>Cancel</button>
                <button className="btn primary" id="ritualBegin" onClick={begin} disabled={beginDisabled}>
                  {beginLabel}
                </button>
              </div>
            </div>
          </section>

          <section className={`ritual-view ritual-await ${stage === "signature" ? "active" : ""}`} id="viewSignature">
            <div className="ritual-await-inner">
              <div className="await-art"><img src={ASSETS.sealedVessel} alt="Sealed Vessel" /></div>
              <div className="eyebrow">THE SUMMONING AWAITS YOUR SIGNATURE</div>
              <h2 className="await-head">Awaiting Wallet.</h2>
              <p className="await-copy">Confirm the transaction in your wallet. The Summoning will continue automatically after it is submitted.</p>
              <div className="await-status">
                <div><span className="live">SIGNATURE REQUEST</span><span className="live">WAITING</span></div>
                <div><span className="muted">TRANSACTION SUBMITTED</span><span className="muted">WAITING</span></div>
                <div><span className="muted">CONFIRMATION</span><span className="muted">WAITING</span></div>
              </div>
              <div className="ritual-actions"><button className="btn" onClick={close}>Close</button></div>
            </div>
          </section>

          <section className={`ritual-view ritual-await ${stage === "chain" ? "active" : ""}`} id="viewChain">
            <div className="ritual-await-inner">
              <div className="await-art"><img src={ASSETS.riteCore} alt="Rite Core" /></div>
              <div className="eyebrow">AWAITING THE CHAIN</div>
              <h2 className="await-head">A Vessel is answering.</h2>
              <p className="await-copy">The transaction has been submitted to {RUNTIME.chain.name}. The page will advance automatically after confirmation.</p>
              <div className="await-status">
                <div><span className="done">SIGNATURE ACCEPTED</span><span className="done">DONE</span></div>
                <div><span className="done">TRANSACTION SUBMITTED</span><span className="done">DONE</span></div>
                <div><span className={isConfirmed ? "done" : "live"}>CONFIRMATION</span><span className={isConfirmed ? "done" : "live"}>{isConfirmed ? "DONE" : isConfirming ? "CONFIRMING" : "PENDING"}</span></div>
              </div>
              {hash && <a className="btn" href={transactionExplorerUrl(hash)} target="_blank" rel="noreferrer">View Transaction</a>}
            </div>
          </section>

          <section className={`ritual-view ritual-success ${stage === "success" ? "active" : ""}`} id="viewSuccess">
            <div className="success-visual"><img src={ASSETS.sealedVessel} alt="Sealed Vessel" /></div>
            <div className="success-copy">
              <div className="eyebrow">THE SUMMONING // COMPLETE</div>
              <h2 id="successHeading">{successHeading}</h2>
              <p id="successCopy">{successCopy}</p>
              <div className="badge-live"><i></i><span>IDENTITY // SEALED</span></div>
              <div className="success-card">
                <div className="ritual-row">
                  <span>{ids.length > 1 ? "Vessel IDs" : "Vessel ID"}</span>
                  <span id="successIds">{ids.length > 0 ? ids.map((id) => <span key={id} style={{ display: "block" }}>{id}</span>) : "CONFIRMED ONCHAIN"}</span>
                </div>
                <div className="ritual-row"><span>Assembly</span><span>{minted === null ? "—" : minted} / {SITE.supply}</span></div>
                <div className="ritual-row"><span>Reveal State</span><span>SEALED</span></div>
                <div className="ritual-row"><span>Network</span><span>{RUNTIME.chain.name}</span></div>
                <div className="ritual-row"><span>Gate State</span><span>SEALED</span></div>
              </div>
              <div className="success-actions">
                <button className="btn" id="returnAssembly" onClick={close}>Return to the Assembly</button>
                <button className="btn primary" id="viewVesselBtn" onClick={close}>View Your Vessel</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
