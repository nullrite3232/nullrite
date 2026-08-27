// NULL RITE — centralized site configuration.
// Public production is currently a pre-launch presentation. Development plumbing
// may use a non-production contract, but public copy must not present it as a live mint.

export const SITE = {
  name: "NULL RITE",
  domain: "nullrite.xyz",
  chainName: "Robinhood Chain",
  chainId: 4663,
  testnetChainId: 46630,
  supply: 3232,
  publicPhase: "PRE_LAUNCH",
  publicSummoningEnabled: false,
  maxMintPerWallet: 10,
  maxPerTx: 5,
  mintCurrency: "ETH",
  mintPriceEth: 0.0001,
  mintPriceLocked: false,
  contractAddress: "0xd3E85fe5D282e1bc49F4A6B189272Ec874D29500",
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
  contract: "https://testnet.blockscout.robinhood.com/address/0xd3E85fe5D282e1bc49F4A6B189272Ec874D29500",
} as const;

export const IPFS = {
  gateway: "https://gateway.lighthouse.storage/ipfs/",
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
