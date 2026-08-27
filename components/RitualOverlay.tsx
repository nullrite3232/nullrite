"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { parseEther, parseEventLogs, zeroAddress } from "viem";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { RH_TESTNET_CHAIN } from "@/lib/chain";
import { ASSETS, SITE } from "@/lib/siteConfig";
import { useAssemblySupply } from "@/lib/useAssemblySupply";

const MINT_ABI = [
  {
    type: "function",
    name: "mint",
    stateMutability: "payable",
    inputs: [{ name: "quantity", type: "uint256" }],
    outputs: [],
  },
] as const;

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
    return "Insufficient testnet ETH for this summoning.";
  }
  if (lower.includes("exceeds") || lower.includes("max")) {
    return "The contract rejected this quantity. Check the per-wallet or per-summoning limit.";
  }
  return message.split("\n")[0] || "Transaction failed.";
}

export function RitualOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { openConnectModal } = useConnectModal() ?? {};
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

  const cost = useMemo(() => {
    const value = SITE.mintPriceEth * qty;
    return Number(value.toFixed(4)).toString();
  }, [qty]);

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
    const next = Math.max(1, Math.min(SITE.maxPerTx, n));
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
      openConnectModal?.();
      return;
    }

    try {
      if (chainId !== RH_TESTNET_CHAIN.id) {
        await switchChainAsync({ chainId: RH_TESTNET_CHAIN.id });
      }

      setStage("signature");
      await writeContractAsync({
        address: SITE.contractAddress as `0x${string}`,
        abi: MINT_ABI,
        functionName: "mint",
        args: [BigInt(qty)],
        value: parseEther(cost),
        chainId: RH_TESTNET_CHAIN.id,
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
    ? "Their final forms remain sealed. The Reveal event will expose each born identity, traits, and rarity later."
    : "Its final form remains sealed. The Reveal event will expose its born identity, traits, and rarity later.";

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
              <div className="eyebrow">THE SUMMONING // TESTNET</div>
              <h2>Call a Vessel.</h2>
              <p>
                Something beyond the Gate is listening. Summon up to {SITE.maxPerTx} Vessels per transaction
                and up to {SITE.maxMintPerWallet} per wallet. Their final identities remain sealed until reveal.
              </p>

              <div className="ritual-qty-wrap">
                <div className="ritual-label">Select how many will answer</div>
                <div className="summon-counter">
                  <button className="counter-btn" id="qtyMinus" aria-label="Decrease quantity" disabled={qty <= 1 || isPending || isConfirming} onClick={() => setQtySafe(qty - 1)}>−</button>
                  <div className="counter-center">
                    <div className="counter-value" id="ritualQty" ref={qtyElRef}>{qty}</div>
                    <div className="counter-caption">{plural ? "VESSELS" : "VESSEL"}</div>
                  </div>
                  <button className="counter-btn" id="qtyPlus" aria-label="Increase quantity" disabled={qty >= SITE.maxPerTx || isPending || isConfirming} onClick={() => setQtySafe(qty + 1)}>+</button>
                </div>
                <div className="counter-meta">
                  <span>MIN / 1</span>
                  <span>MAX / {SITE.maxPerTx} PER SUMMONING</span>
                </div>
              </div>

              <div className="ritual-data">
                <div className="ritual-row"><span>Summoning Cost</span><span id="sumCost">{cost} ETH</span></div>
                <div className="ritual-row"><span>Network</span><span>Robinhood Testnet</span></div>
                <div className="ritual-row"><span>Reveal State</span><span>SEALED</span></div>
                <div className="ritual-row">
                  <span>Vessels Summoned</span>
                  <span>{minted === null ? "—" : minted.toLocaleString()} / {SITE.supply.toLocaleString()}</span>
                </div>
              </div>

              {txError && <div className="ritual-error">{txError}</div>}

              <div className="ritual-actions">
                <button className="btn" id="ritualCancel" onClick={close}>Cancel</button>
                <button className="btn primary" id="ritualBegin" onClick={begin} disabled={isPending || isConfirming || remaining === 0}>
                  {isPending ? "Awaiting Signature" : "Begin the Rite"}
                </button>
              </div>
            </div>
          </section>

          <section className={`ritual-view ritual-await ${stage === "signature" ? "active" : ""}`} id="viewSignature">
            <div className="ritual-await-inner">
              <div className="await-art"><img src={ASSETS.sealedVessel} alt="Sealed Vessel" /></div>
              <div className="eyebrow">THE RITE AWAITS YOUR SIGNATURE</div>
              <h2 className="await-head">Awaiting Wallet.</h2>
              <p className="await-copy">Confirm the transaction in your wallet. This testnet transaction will continue automatically after it is submitted.</p>
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
              <p className="await-copy">The transaction has been submitted to Robinhood Testnet. The page will advance automatically after confirmation.</p>
              <div className="await-status">
                <div><span className="done">SIGNATURE ACCEPTED</span><span className="done">DONE</span></div>
                <div><span className="done">TRANSACTION SUBMITTED</span><span className="done">DONE</span></div>
                <div><span className={isConfirmed ? "done" : "live"}>CONFIRMATION</span><span className={isConfirmed ? "done" : "live"}>{isConfirmed ? "DONE" : isConfirming ? "CONFIRMING" : "PENDING"}</span></div>
              </div>
              {hash && <a className="btn" href={`https://explorer.testnet.chain.robinhood.com/tx/${hash}`} target="_blank" rel="noreferrer">View Transaction</a>}
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
                <div className="ritual-row"><span>Assembly</span><span>{minted === null ? "—" : minted.toLocaleString()} / {SITE.supply.toLocaleString()}</span></div>
                <div className="ritual-row"><span>Reveal State</span><span>SEALED</span></div>
                <div className="ritual-row"><span>Network</span><span>Robinhood Testnet</span></div>
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
