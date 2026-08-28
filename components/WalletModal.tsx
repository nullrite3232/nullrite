"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { walletConnectConfigured } from "@/lib/wallet";
import { useProtocolPhase } from "@/lib/useProtocolPhase";

type WalletModalContextValue = {
  openWalletModal: () => void;
  closeWalletModal: () => void;
};

type PopularWallet = {
  key: string;
  name: string;
  match: readonly string[];
  href: string;
};

const POPULAR_WALLETS: readonly PopularWallet[] = [
  {
    key: "metamask",
    name: "MetaMask",
    match: ["metamask"],
    href: "https://metamask.io/download/",
  },
  {
    key: "rabby",
    name: "Rabby",
    match: ["rabby"],
    href: "https://rabby.io/",
  },
  {
    key: "okx",
    name: "OKX Wallet",
    match: ["okx", "okex"],
    href: "https://www.okx.com/web3",
  },
  {
    key: "binance",
    name: "Binance Wallet",
    match: ["binance"],
    href: "https://www.binance.com/en/web3wallet",
  },
  {
    key: "coinbase",
    name: "Coinbase Wallet",
    match: ["coinbase"],
    href: "https://www.coinbase.com/wallet",
  },
] as const;

const WalletModalContext = createContext<WalletModalContextValue>({
  openWalletModal: () => {},
  closeWalletModal: () => {},
});

export function useWalletModal() {
  return useContext(WalletModalContext);
}

function scoreConnector(name: string, id: string) {
  const key = `${name} ${id}`.toLowerCase();
  if (key.includes("okx") || key.includes("okex")) return 0;
  if (key.includes("rabby")) return 1;
  if (key.includes("metamask")) return 2;
  if (key.includes("binance")) return 3;
  if (key.includes("coinbase")) return 4;
  if (key.includes("walletconnect")) return 20;
  if (key.includes("injected")) return 30;
  return 10;
}

function isWalletConnectConnector(name: string, id: string) {
  return `${name} ${id}`.toLowerCase().includes("walletconnect");
}

function isGenericInjectedConnector(name: string, id: string) {
  const key = `${name} ${id}`.toLowerCase();
  return key === "injected injected" || key.includes("injected injected");
}

function matchesPopularWallet(
  name: string,
  id: string,
  wallet: PopularWallet
) {
  const key = `${name} ${id}`.toLowerCase();
  return wallet.match.some((needle) => key.includes(needle));
}

function cleanError(message?: string) {
  if (!message) return null;
  const firstLine = message.split("\n")[0];
  if (/user rejected|user denied|request rejected/i.test(firstLine)) {
    return "Connection request rejected in wallet.";
  }
  if (/provider not found/i.test(firstLine)) {
    return "No usable browser wallet provider was found for that option.";
  }
  return firstLine;
}

export function WalletModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingUid, setPendingUid] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [hasLegacyProvider, setHasLegacyProvider] = useState(false);
  const { address, connector, isConnected, chainId } = useAccount();
  const { connectors, connectAsync, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const phase = useProtocolPhase();

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;

    const refreshProviders = () => {
      setHasLegacyProvider(Boolean((window as any).ethereum));
      window.dispatchEvent(new Event("eip6963:requestProvider"));
    };

    refreshProviders();
    const retry = window.setTimeout(refreshProviders, 250);
    return () => window.clearTimeout(retry);
  }, [isOpen]);

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

  const installedConnectors = useMemo(
    () =>
      orderedConnectors.filter(
        (item) =>
          !isWalletConnectConnector(item.name, item.id) &&
          !isGenericInjectedConnector(item.name, item.id)
      ),
    [orderedConnectors]
  );

  const walletConnectors = useMemo(
    () =>
      orderedConnectors.filter((item) =>
        isWalletConnectConnector(item.name, item.id)
      ),
    [orderedConnectors]
  );

  const browserFallback = useMemo(
    () =>
      hasLegacyProvider
        ? orderedConnectors.find((item) =>
            isGenericInjectedConnector(item.name, item.id)
          ) ?? null
        : null,
    [hasLegacyProvider, orderedConnectors]
  );

  const popularWallets = useMemo(
    () =>
      POPULAR_WALLETS.map((wallet) => ({
        wallet,
        connector:
          installedConnectors.find((item) =>
            matchesPopularWallet(item.name, item.id, wallet)
          ) ?? null,
      })),
    [installedConnectors]
  );

  const connect = async (target: (typeof connectors)[number]) => {
    const usesWalletConnect = isWalletConnectConnector(target.name, target.id);
    setLocalError(null);
    setPendingUid(target.uid);

    if (usesWalletConnect && typeof window !== "undefined") {
      // Remove the NULL RITE overlay before WalletConnect mounts its own modal.
      // Waiting one animation frame prevents the two fullscreen layers from
      // competing for z-index/focus on mobile browsers.
      setIsOpen(false);
      await new Promise<void>((resolve) =>
        window.requestAnimationFrame(() => resolve())
      );
    }

    try {
      await connectAsync({ connector: target });
      setIsOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setLocalError(cleanError(message));
      if (usesWalletConnect) setIsOpen(true);
    } finally {
      setPendingUid(null);
    }
  };

  const shortAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : "";

  const networkLabel =
    chainId === 4663
      ? "ROBINHOOD CHAIN"
      : chainId === 46630
        ? "ROBINHOOD TESTNET"
        : chainId
          ? `CHAIN ${chainId}`
          : "NOT CONNECTED";

  const summoningLabel =
    phase.summoningState === "PRE_LAUNCH"
      ? "SEALED"
      : phase.summoningState;

  const renderConnector = (
    item: (typeof connectors)[number],
    options?: {
      walletConnect?: boolean;
      browser?: boolean;
      label?: string;
      description?: string;
    }
  ) => {
    const waiting = isPending && pendingUid === item.uid;
    const label =
      options?.label ??
      (options?.walletConnect
        ? "WalletConnect"
        : options?.browser
          ? "Browser Wallet"
          : item.name);
    const description =
      options?.description ??
      (options?.walletConnect
        ? "Mobile handoff / QR fallback"
        : options?.browser
          ? "Legacy injected provider fallback"
          : /okx|okex/i.test(item.name)
            ? "Installed // recommended"
            : "Installed wallet");

    return (
      <button
        className={`wallet-option ${options?.walletConnect ? "wallet-option-more" : ""}`}
        key={`${item.uid}:${label}`}
        disabled={isPending}
        onClick={() => void connect(item)}
      >
        <span className="wallet-option-icon">
          {item.icon ? (
            <img src={item.icon} alt="" />
          ) : (
            label.slice(0, 2).toUpperCase()
          )}
        </span>
        <span className="wallet-option-copy">
          <strong>{waiting ? "OPENING WALLET…" : label}</strong>
          <small>{description}</small>
        </span>
        <span className="wallet-option-arrow">↗</span>
      </button>
    );
  };

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
                  Your wallet is connected to NULL RITE. Network switching happens
                  only when an onchain action actually requires it.
                </p>

                <div className="wallet-account-grid">
                  <div>
                    <span>WALLET</span>
                    <strong>{connector?.name ?? "CONNECTED"}</strong>
                  </div>
                  <div>
                    <span>NETWORK</span>
                    <strong>{networkLabel}</strong>
                  </div>
                  <div>
                    <span>SUMMONING</span>
                    <strong>{summoningLabel}</strong>
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
                  Installed wallets are discovered through EIP-6963 and connect to
                  the exact provider you select. Mobile and QR access uses the
                  explicit WalletConnect fallback below.
                </p>

                {installedConnectors.length > 0 && (
                  <>
                    <div className="eyebrow">INSTALLED</div>
                    <div className="wallet-options">
                      {installedConnectors.map((item) => renderConnector(item))}
                    </div>
                  </>
                )}

                <div className="eyebrow">POPULAR</div>
                <div className="wallet-options">
                  {popularWallets.map(({ wallet, connector: target }) =>
                    target ? (
                      renderConnector(target, {
                        label: wallet.name,
                        description: "Installed // exact provider",
                      })
                    ) : (
                      <a
                        className="wallet-option wallet-option-more"
                        href={wallet.href}
                        target="_blank"
                        rel="noreferrer"
                        key={wallet.key}
                      >
                        <span className="wallet-option-icon">
                          {wallet.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="wallet-option-copy">
                          <strong>{wallet.name}</strong>
                          <small>Not installed // get wallet</small>
                        </span>
                        <span className="wallet-option-arrow">↗</span>
                      </a>
                    )
                  )}
                </div>

                {walletConnectors.length > 0 && (
                  <>
                    <div className="eyebrow">MOBILE / QR</div>
                    <div className="wallet-options">
                      {walletConnectors.map((item) =>
                        renderConnector(item, { walletConnect: true })
                      )}
                    </div>
                  </>
                )}

                {browserFallback && (
                  <>
                    <div className="eyebrow">MORE / LEGACY</div>
                    <div className="wallet-options">
                      {renderConnector(browserFallback, { browser: true })}
                    </div>
                  </>
                )}

                {installedConnectors.length === 0 && !browserFallback && (
                  <div className="wallet-project-note">
                    NO INSTALLED WALLET PROVIDER DETECTED. USE MOBILE / QR OR INSTALL
                    A SUPPORTED EVM WALLET.
                  </div>
                )}

                {!walletConnectConfigured && (
                  <div className="wallet-project-note">
                    MOBILE / QR IS DISABLED BECAUSE NO WALLETCONNECT PROJECT ID IS
                    CONFIGURED FOR THIS NETWORK.
                  </div>
                )}

                {(localError || error) && (
                  <div className="wallet-modal-error">
                    {localError ?? cleanError(error?.message)}
                  </div>
                )}

                <div className="wallet-modal-foot">
                  Installed-wallet selection is isolated through EIP-6963. The
                  legacy browser fallback is intentionally separate because it may
                  represent whichever provider owns window.ethereum.
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </WalletModalContext.Provider>
  );
}
