// NULL RITE — centralized site configuration (MASTER CONCEPT SPEC V1)
// Spec §29: use configuration values, do NOT hardcode across files.
// Anything marked TBA in the spec stays "" here until provided.

export const SITE = {
  name: "NULL RITE",
  domain: "nullrite.xyz", // §23
  chainName: "Robinhood Chain",
  supply: 3232, // §27 TOTAL SUPPLY
  maxMintPerWallet: 10, // §27
  mintCurrency: "ETH", // §27
  mintPriceEth: 0.01, // §27 — PLACEHOLDER (not locked)
  mintPriceLocked: false, // spec: placeholder unless explicitly confirmed
  contractAddress: "", // TBA §28
};

// V1 live vs sealed states (§24, §27)
export const STATE = {
  reveal: "SEALED", // pre-reveal (§12)
  gate: "SEALED", // §19 current V1
  rite: "DORMANT", // $RITE §6
  gateComing: "RESONANCE", // coming state §26
};

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
};

export const SOCIALS = {
  x: "", // TBA §28
  discord: "", // TBA §28
  docs: "",
  contract: "", // when deployed
};
