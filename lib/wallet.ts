import { createConfig } from "wagmi";
import {
  createConnector,
  injected,
  type CreateConnectorFn,
} from "@wagmi/core";
import { defineChain, getAddress, http, numberToHex } from "viem";
import { RH_CHAIN } from "@/lib/chain";

const LEGACY_PLACEHOLDER = "your_walletconnect_project_id_here";
const rawProjectId =
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ||
  process.env.NEXT_PUBLIC_WC_ID ||
  "";

export const walletConnectConfigured =
  rawProjectId.length >= 24 && rawProjectId !== LEGACY_PLACEHOLDER;

export const walletProjectId = walletConnectConfigured ? rawProjectId : "";

export const robinhoodChain = defineChain({
  id: RH_CHAIN.id,
  name: RH_CHAIN.name,
  nativeCurrency: RH_CHAIN.nativeCurrency,
  rpcUrls: RH_CHAIN.rpcUrls,
  blockExplorers: RH_CHAIN.blockExplorers,
});

const walletMetadata = {
  name: "NULL RITE",
  description: "A persistent onchain ritual on Robinhood Chain.",
  url: "https://nullrite-web.vercel.app",
  icons: [
    "https://res.cloudinary.com/ugbfexbl/image/upload/v1787805854/rite-core.png",
  ],
};

function createWalletConnectConnector(projectId: string): CreateConnectorFn {
  return createConnector((config) => {
    let provider: any;
    let accountsChanged: ((accounts: string[]) => void) | undefined;
    let chainChanged: ((chainId: string | number) => void) | undefined;
    let disconnected: (() => void) | undefined;

    async function getProvider() {
      if (provider) return provider;

      const { EthereumProvider } = await import(
        "@walletconnect/ethereum-provider"
      );

      provider = await EthereumProvider.init({
        projectId,
        metadata: walletMetadata,
        optionalChains: [robinhoodChain.id],
        rpcMap: {
          [robinhoodChain.id]: robinhoodChain.rpcUrls.default.http[0],
        },
        showQrModal: true,
      });

      return provider;
    }

    function attachListeners(target: any) {
      if (!accountsChanged) {
        accountsChanged = (accounts: string[]) => {
          if (!accounts.length) {
            config.emitter.emit("disconnect");
            return;
          }
          config.emitter.emit("change", {
            accounts: accounts.map((account) => getAddress(account)),
          });
        };
        target.on("accountsChanged", accountsChanged);
      }

      if (!chainChanged) {
        chainChanged = (chainId: string | number) => {
          config.emitter.emit("change", { chainId: Number(chainId) });
        };
        target.on("chainChanged", chainChanged);
      }

      if (!disconnected) {
        disconnected = () => config.emitter.emit("disconnect");
        target.on("disconnect", disconnected);
        target.on("session_delete", disconnected);
      }
    }

    return {
      id: "walletConnect",
      name: "WalletConnect",
      type: "walletConnect",

      async setup() {
        const target = await getProvider().catch(() => null);
        if (target) attachListeners(target);
      },

      async connect({ chainId } = {}) {
        const target = await getProvider();
        const requestedChainId = chainId ?? robinhoodChain.id;

        if (!target.session) {
          await target.connect({ optionalChains: [requestedChainId] });
        }

        const rawAccounts = target.accounts?.length
          ? target.accounts
          : await target.enable();
        const accounts = rawAccounts.map((account: string) => getAddress(account));

        if (!accounts.length) throw new Error("No wallet account was returned.");

        attachListeners(target);

        return {
          accounts,
          chainId: Number(target.chainId || requestedChainId),
        };
      },

      async disconnect() {
        const target = await getProvider();
        if (target.session) await target.disconnect();
      },

      async getAccounts() {
        const target = await getProvider();
        return (target.accounts ?? []).map((account: string) => getAddress(account));
      },

      async getChainId() {
        const target = await getProvider();
        return Number(target.chainId || robinhoodChain.id);
      },

      async getProvider() {
        return getProvider();
      },

      async isAuthorized() {
        try {
          const target = await getProvider();
          return Boolean(target.session && target.accounts?.length);
        } catch {
          return false;
        }
      },

      async switchChain({ chainId }) {
        const target = await getProvider();
        const chain = config.chains.find((item) => item.id === chainId);
        if (!chain) throw new Error("Unsupported chain.");

        try {
          await target.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: numberToHex(chainId) }],
          });
        } catch {
          await target.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: numberToHex(chainId),
                chainName: chain.name,
                nativeCurrency: chain.nativeCurrency,
                rpcUrls: [...chain.rpcUrls.default.http],
                blockExplorerUrls: chain.blockExplorers?.default.url
                  ? [chain.blockExplorers.default.url]
                  : [],
              },
            ],
          });
        }

        return chain;
      },
    };
  });
}

const connectors: CreateConnectorFn[] = [injected({ shimDisconnect: true })];
if (walletConnectConfigured) {
  connectors.push(createWalletConnectConnector(walletProjectId));
}

export const wagmiConfig = createConfig({
  chains: [robinhoodChain],
  connectors,
  transports: {
    [robinhoodChain.id]: http(robinhoodChain.rpcUrls.default.http[0]),
  },
  multiInjectedProviderDiscovery: true,
  ssr: true,
});
