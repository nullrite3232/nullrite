// NULL RITE — centralized site configuration (MASTER CONCEPT SPEC V1)
// Spec §29: use configuration values, do NOT hardcode across files.
// Anything marked TBA in the spec stays "" here until provided.

export const SITE = {
  name: "NULL RITE",
  domain: "nullrite.xyz", // §23
  chainName: "Robinhood Chain",
  chainId: 4663,
  testnetChainId: 46630,
  supply: 3232, // §27 TOTAL SUPPLY
  maxMintPerWallet: 10, // §27
  mintCurrency: "ETH", // §27
  mintPriceEth: 0.01, // §27 — PLACEHOLDER (not locked)
  mintPriceLocked: false, // spec: placeholder unless explicitly confirmed
  contractAddress: "0xd3E85fe5D282e1bc49F4A6B189272Ec874D29500", // Vessel NFT
} as const;

// V1 live vs sealed states (§24, §27)
export const STATE = {
  reveal: "SEALED", // pre-reveal (§12)
  gate: "SEALED", // §19 current V1
  rite: "DORMANT", // $RITE §6
  gateComing: "RESONANCE", // coming state §26
} as const;

// Locked terminology (§26)
export const TERMS = {
  nft: "VESSEL",
  mint: "THE SUMMONING",
  mintCta: "SUMMON A VESSEL",
  mintAction: "BEGIN THE RITE",
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
  collectionCID: "QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // TODO: replace with actual CID after upload
} as const;

// v15 media assets — hosted on Cloudinary (replaces v13 inline base64)
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