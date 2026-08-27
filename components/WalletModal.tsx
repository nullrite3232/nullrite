"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
} from "wagmi";
import { walletConnectConfigured } from "@/lib/wallet";

type WalletModalContextValue = {
  openWalletModal: () => void;
  closeWalletModal: () => void;
};

const WalletModalContext = createContext<WalletModalContextValue>({
  openWalletModal: () => {},
  closeWalletModal: () => {},
});

export function useWalletModal() {
  return useContext(WalletModalContext);
}

function scoreConnector(name: string, id: string) {
  const key = `${name} ${id}`.toLowerCase();
  if (key.includes("okx")) return 0;
  if (key.includes("rabby")) return 1;
  if (key.includes("metamask")) return 2;
  if (key.includes("walletconnect")) return 20;
  if (key.includes("injected")) return 30;
  return 10;
}

function cleanError(message?: string) {
  if (!message) return null;
  const firstLine = message.split("\n")[0];
  if (/user rejected|user denied|request rejected/i.test(firstLine)) {
    return "Connection request rejected in wallet.";
  }
  return firstLine;
}

export function WalletModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingUid, setPendingUid] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const { address, connector, isConnected, chainId } = useAccount();
  const { connectors, connectAsync, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const orderedConnectors = useMemo(() => {
    const seen = new Set<string>();
    return [...connectors]
      .filter((item) => {
        const key = `${item.id}:${item.name}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort(
        (a, b) =>
          scoreConnector(a.name, a.id) - scoreConnector(b.name, b.id)
      );
  }, [connectors]);

  const connect = async (target: (typeof connectors)[number]) => {
    setLocalError(null);
    setPendingUid(target.uid);
    try {
      await connectAsync({ connector: target });
      setIsOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setLocalError(cleanError(message));
    } finally {
      setPendingUid(null);
    }
  };

  const shortAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : "";

  return (
    <WalletModalContext.Provider
      value={{
        openWalletModal: () => {
          setLocalError(null);
          setIsOpen(true);
        },
        closeWalletModal: () => setIsOpen(false),
      }}
    >
      {children}

      {isOpen && (
        <div
          className="wallet-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setIsOpen(false);
          }}
        >
          <section
            className="wallet-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Connect wallet"
          >
            <div className="wallet-modal-topline">
              <span>WALLET ACCESS // NULL RITE</span>
              <button
                className="wallet-modal-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close wallet modal"
              >
                ×
              </button>
            </div>

            {isConnected && address ? (
              <div className="wallet-account-view">
                <div className="eyebrow">IDENTITY // CONNECTED</div>
                <h2>{shortAddress}</h2>
                <p>
                  Your wallet is connected to NULL RITE. Connection does not open
                  the Summoning and does not force a network switch.
                </p>

                <div className="wallet-account-grid">
                  <div>
                    <span>WALLET</span>
                    <strong>{connector?.name ?? "CONNECTED"}</strong>
                  </div>
                  <div>
                    <span>NETWORK</span>
                    <strong>
                      {chainId === 4663 ? "ROBINHOOD CHAIN" : `CHAIN ${chainId}`}
                    </strong>
                  </div>
                  <div>
                    <span>SUMMONING</span>
                    <strong>SEALED</strong>
                  </div>
                </div>

                <div className="wallet-modal-actions">
                  <button className="btn" onClick={() => setIsOpen(false)}>
                    Close
                  </button>
                  <button
                    className="btn wallet-disconnect"
                    onClick={() => {
                      disconnect();
                      setIsOpen(false);
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="wallet-connect-view">
                <div className="eyebrow">CONNECT TO NULL RITE</div>
                <h2>Choose your wallet.</h2>
                <p>
                  Connect only to identify your wallet. Network switching happens
                  only when an onchain action actually requires it.
                </p>

                <div className="wallet-options">
                  {orderedConnectors.map((item) => {
                    const waiting = isPending && pendingUid === item.uid;
                    const isWalletConnect = item.id.toLowerCase().includes("walletconnect");
                    const label = isWalletConnect ? "Mobile & more wallets" : item.name;
                    return (
                      <button
                        className={`wallet-option ${isWalletConnect ? "wallet-option-more" : ""}`}
                        key={item.uid}
                        disabled={isPending}
                        onClick={() => void connect(item)}
                      >
                        <span className="wallet-option-icon">
                          {item.icon ? (
                            <img src={item.icon} alt="" />
                          ) : (
                            item.name.slice(0, 2).toUpperCase()
                          )}
                        </span>
                        <span className="wallet-option-copy">
                          <strong>{waiting ? "OPENING WALLET…" : label}</strong>
                          <small>
                            {isWalletConnect
                              ? "WalletConnect mobile handoff / QR fallback"
                              : /okx/i.test(item.name)
                                ? "Recommended"
                                : "Detected wallet"}
                          </small>
                        </span>
                        <span className="wallet-option-arrow">↗</span>
                      </button>
                    );
                  })}
                </div>

                {!walletConnectConfigured && (
                  <div className="wallet-project-note">
                    MOBILE HANDOFF // A REOWN / WALLETCONNECT PROJECT ID MUST BE
                    CONFIGURED BEFORE PUBLIC LAUNCH.
                  </div>
                )}

                {(localError || error) && (
                  <div className="wallet-modal-error">
                    {localError ?? cleanError(error?.message)}
                  </div>
                )}

                <div className="wallet-modal-foot">
                  EIP-6963 discovery for installed wallets. WalletConnect is used
                  only as the mobile / fallback transport.
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </WalletModalContext.Provider>
  );
}
