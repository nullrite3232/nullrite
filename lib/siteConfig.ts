import { RH_TESTNET_CHAIN } from "@/lib/chain";
import { RUNTIME } from "@/lib/runtime";

const PUBLIC_SUPPLY = 3232;

// NULL RITE — centralized production site configuration.
// Mainnet runtime is fixed to Robinhood Chain. These mint values mirror the
// deployed mainnet constructor as UI fallbacks; live contract reads remain authoritative.
export const SITE = {
  name: "NULL RITE",
  domain: "nullrite.xyz",
  chainName: RUNTIME.chain.name,
  chainId: RUNTIME.chain.id,
  testnetChainId: RH_TESTNET_CHAIN.id,
  runtimeNetwork: RUNTIME.network,
  supply: PUBLIC_SUPPLY,
  publicPhase: "SUMMONING",
  // Onchain Summoning has been activated. This flag is only a production UI
  // fallback so a transient RPC read cannot regress the overlay to PRE_LAUNCH.
  // RitualOverlay still performs live contract checks before any mint write.
  publicSummoningEnabled: true,
  maxMintPerWallet: 10,
  maxPerTx: 10,
  mintCurrency: "ETH",
  mintPriceEth: 0.0005,
  mintPriceLocked: true,
  contractAddress: RUNTIME.contractAddress,
  contractConfigured: RUNTIME.contractConfigured,
} as const;

export const STATE = {
  summoning: "OPEN",
  reveal: "SEALED",
  gate: "SEALED",
  rite: "DORMANT",
  gateComing: "RESONANCE",
} as const;

export const TERMS = {
  nft: "VESSEL",
  mint: "THE SUMMONING",
  mintCta: "SUMMON A VESSEL",
  mintAction: "SUMMON A VESSEL",
  mintPriceLabel: "SUMMONING COST",
  postMint: "A VESSEL HAS ANSWERED.",
  preReveal: "IDENTITY // SEALED",
  reveal: "THE REVEAL",
  token: "$RITE",
  tokenVisual: "THE RITE CORE",
  gate: "THE GATE",
  history: "THE RECORD",
  early: "THE CALLING",
} as const;

export const SOCIALS = {
  x: "https://x.com/nullrite3232",
  discord: "https://discord.gg/nullrite",
  docs: "https://docs.nullrite.xyz",
  contract: RUNTIME.contractConfigured
    ? `${RUNTIME.chain.blockExplorers.default.url}/address/${RUNTIME.contractAddress}`
    : "",
} as const;

export const IPFS = {
  // Browser transport only. Canonical NFT metadata remains ipfs:// onchain.
  gateway: "https://pleased-jellyfish-6s9j4.lighthouseweb3.xyz/ipfs/",
  collectionCID: "QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
} as const;

export const ASSETS = {
  gateLoop:
    "https://res.cloudinary.com/ugbfexbl/video/upload/v1787805853/gate-loop-web-optimized.mp4",
  vesselGroup:
    "https://res.cloudinary.com/ugbfexbl/image/upload/v1787805854/vessel-group.png",
  riteCore:
    "https://res.cloudinary.com/ugbfexbl/image/upload/v1787805854/rite-core.png",
  sealedVessel:
    "https://res.cloudinary.com/ugbfexbl/image/upload/v1787805863/sealed-vessel.png",
} as const;
