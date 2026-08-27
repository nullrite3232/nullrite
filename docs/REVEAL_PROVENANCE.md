# NULL RITE — Reveal Provenance Policy

Status: **locked design for mainnet implementation**

This document defines the fairness requirements for the 3232 Vessel reveal. It does not publish a provenance hash yet because the final mainnet metadata set has not been frozen.

## Locked rules

1. **Token IDs remain sequential.** Vessel IDs are minted as normal onchain token identities.
2. **Final artwork, traits and rarity assignment are randomized at Reveal.** Mint order must not determine a Vessel's final form.
3. **The complete reveal set is frozen before the reveal seed is known.** A canonical manifest of all 3232 final metadata entries is produced first.
4. **A provenance commitment is published before the seed.** The manifest is committed using a cryptographic provenance hash so the set cannot be silently rearranged afterward.
5. **The seed source is declared before its value is knowable.** The mainnet implementation must use a verifiable onchain randomness/seed source whose selection is fixed before the result exists.
6. **Assignment is deterministic from the published commitment + seed.** Anyone must be able to reproduce the final token-ID-to-metadata assignment from public data.
7. **Verification artifacts are published.** After Reveal, NULL RITE publishes the manifest, provenance hash, seed reference and deterministic assignment procedure/verifier.
8. **No rarity reservation by mint order.** The reveal mechanism must not allow the team to map known rare artwork to chosen sequential token IDs after the seed is known.

## Mainnet release requirement

Before the mainnet Reveal can be armed, the following must be finalized and published:

- canonical 3232-item metadata manifest;
- provenance hash;
- exact onchain seed source and reference rule;
- deterministic shuffle/assignment algorithm;
- public verification instructions or script.

The public website may describe the mechanism before these values exist, but it must not claim that provenance has already been committed until the final hash is actually published.
