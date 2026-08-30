import { createConfig } from "wagmi";
import { createConnector, injected } from "@wagmi/core";
import { defineChain, getAddress, http, numberToHex } from "viem";
import { RH_CHAIN } from "@/lib/chain";
import { RUNTIME } from "@/lib/runtime";

const legacyProjectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID?.trim() ?? "";
const mainnetProjectId =
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID_MAINNET?.trim() ?? "";
const rawProjectId = mainnetProjectId || legacyProjectId;

export const walletConnectConfigured = rawProjectId.length >= 24;
export const walletProjectId = walletConnectConfigured ? rawProjectId : "";

// Mainnet prep exposes exactly Robinhood Chain mainnet. Testnet rehearsal stays
// isolated on its preview branch and must not leak transport/runtime logic here.
export const robinhoodChain = defineChain({
  id: RUNTIME.chain.id,
  name: RUNTIME.chain.name,
  nativeCurrency: RUNTIME.chain.nativeCurrency,
  rpcUrls: RUNTIME.chain.rpcUrls,
  blockExplorers: RUNTIME.chain.blockExplorers,
});

const walletMetadata = {
  name: "NULL RITE",
  description: "A persistent onchain ritual on Robinhood Chain.",
  url: "https://nullrite.xyz",
  icons: [
    "https://res.cloudinary.com/ugbfexbl/image/upload/v1787805854/rite-core.png",
  ],
};

function createWalletConnectConnector(projectId: string) {
  return createConnector(((config: any) => {
    let provider: any;

    async function getProvider() {
      if (provider) return provider;
      const { EthereumProvider } = await import("@walletconnect/ethereum-provider");
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

    const connector: any = {
      id: "walletConnect",
      name: "WalletConnect",
      type: "walletConnect",

      async setup() {
        const target = await getProvider().catch(() => null);
        if (!target) return;
        target.on("accountsChanged", connector.onAccountsChanged);
        target.on("chainChanged", connector.onChainChanged);
        target.on("disconnect", connector.onDisconnect);
        target.on("session_delete", connector.onDisconnect);
      },

      async connect({ chainId }: { chainId?: number } = {}) {
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

      async switchChain({ chainId }: { chainId: number }) {
        const target = await getProvider();
        const chain = config.chains.find((item: any) => item.id === chainId);
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

      onAccountsChanged(accounts: string[]) {
        if (!accounts.length) {
          config.emitter.emit("disconnect");
          return;
        }
        config.emitter.emit("change", {
          accounts: accounts.map((account) => getAddress(account)),
        });
      },

      onChainChanged(chainId: string) {
        config.emitter.emit("change", { chainId: Number(chainId) });
      },

      onDisconnect() {
        config.emitter.emit("disconnect");
      },
    };

    return connector;
  }) as any);
}

const connectors: any[] = [injected({ shimDisconnect: true })];
if (walletConnectConfigured) {
  connectors.push(createWalletConnectConnector(walletProjectId));
}

export const wagmiConfig = createConfig({
  chains: [robinhoodChain],
  connectors,
  transports: {
    [RH_CHAIN.id]: http(RH_CHAIN.rpcUrls.default.http[0]),
  },
  multiInjectedProviderDiscovery: true,
  ssr: true,
});
