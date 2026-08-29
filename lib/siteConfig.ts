import { RH_TESTNET_CHAIN } from "@/lib/chain";
import { RUNTIME } from "@/lib/runtime";

const PUBLIC_SUPPLY = 3232;

// PHASE D REHEARSAL PREVIEW ONLY.
// Testnet UI mirrors the 10-supply harness.
// MUST NOT merge into main.
const PHASE_D_REHEARSAL_SUPPLY = 10;

// Rehearsal supply can only alter testnet UI math. Mainnet is hard-pinned to
// the canonical 3232 Vessel supply regardless of environment input.
const runtimeSupply = RUNTIME.isTestnet
  ? PHASE_D_REHEARSAL_SUPPLY
  : PUBLIC_SUPPLY;

// NULL RITE — centralized site configuration.
// Runtime chain/address come from lib/runtime so testnet -> mainnet does not
// require component rewrites.
export const SITE = {
  name: "NULL RITE",
  domain: "nullrite.xyz",
  chainName: RUNTIME.chain.name,
  chainId: RUNTIME.chain.id,
  testnetChainId: RH_TESTNET_CHAIN.id,
  runtimeNetwork: RUNTIME.network,
  supply: runtimeSupply,
  publicPhase: "PRE_LAUNCH",
  publicSummoningEnabled: false,
  maxMintPerWallet: 10,
  maxPerTx: 10,
  mintCurrency: "ETH",
  mintPriceEth: 0.0001,
  mintPriceLocked: false,
  contractAddress: RUNTIME.contractAddress,
  contractConfigured: RUNTIME.contractConfigured,
} as const;

export const STATE = {
  summoning: "SEALED",
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
  // Route IPFS reads through our own multi-gateway fallback proxy so the
  // viewer does not fail when one public gateway is unavailable or gated.
  gateway: "/api/ipfs/",
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
