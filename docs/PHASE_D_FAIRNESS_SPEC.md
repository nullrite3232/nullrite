# NULL RITE — Phase D Rehearsal Fairness Specification v1

## Scope

This specification is for the 10-supply Robinhood Testnet Phase D rehearsal only. It is not the final 3,232-token mainnet randomness design.

Contract:

`0x0ab741e1c3377854678958404e749c2a1e71e0e2`

Chain:

`Robinhood Testnet / 46630`

## Frozen reveal inventory

The source inventory is `fairness/phase-d-rehearsal-manifest.json`.

It contains exactly 10 original production image entries, source token IDs 1 through 10, copied from the pre-upload production manifest reported during D13.1. The manifest binds:

- exact source ID;
- exact `Vessel_XXXX.png` filename;
- Born Rarity;
- source-relative rarity path;
- source byte count;
- original image root CID;
- rehearsal chain and contract.

The selected ten are a functional rehearsal sample only. Their rarity mix is not intended to represent the 3,232 production distribution.

No final minted-token-to-image assignment is stored in the frozen manifest.

## Canonical JSON v1

Before hashing, the JSON value is serialized with these rules:

1. object keys are sorted lexicographically;
2. array order is preserved;
3. strings and booleans use JSON encoding;
4. numbers must be safe integers and are encoded in base-10 without extra whitespace;
5. UTF-8 encoding;
6. no BOM;
7. no whitespace outside encoded JSON values;
8. no trailing newline is included in the hashed canonical byte string.

`provenanceHash = keccak256(canonical_manifest_utf8_bytes)`

The canonicalization and hash implementation is in `scripts/phase-d-fairness-lib.mjs`.

## Provenance transaction

Provenance may be committed only after:

- rehearsal supply is 10/10;
- remaining supply is 0;
- public mint has auto-closed;
- Reveal is still false;
- current onchain provenance is zero;
- the reviewed local provenance hash exactly equals the manifest hash.

The owner transaction is:

`commitProvenance(bytes32 provenanceHash)`

The transaction block becomes the anchor block.

## Future seed

Let:

`P = provenance transaction block number`

Then:

`SEED_BLOCK = P + 20`

The seed is exactly:

`SEED = blockHash(SEED_BLOCK)`

The seed must not be obtained before the provenance transaction is mined.

If the seed block has not been mined yet, tooling must stop and wait.

## Deterministic assignment

Domain:

`NULL_RITE_PHASE_D_ASSIGNMENT_V1`

For every frozen source item `source_token_id`, compute:

`score = keccak256(abi.encodePacked(DOMAIN, provenanceHash, SEED, uint256(source_token_id)))`

Sort all ten source items by `score` ascending. If a cryptographic hash collision occurs, use `source_token_id` ascending as the deterministic tie-breaker.

The source item at sorted position 0 is assigned to minted token ID 1, position 1 to minted token ID 2, and so on through token ID 10.

This hash-sort construction avoids modulo reduction and produces a deterministic one-to-one permutation.

## Metadata after assignment

Do not upload final rehearsal metadata before the seed is known and the assignment has been reproduced.

For each minted token ID 1..10, the metadata image must point to the assigned original image:

`ipfs://QmPax47qCinP2c6hj77F4CBvB74VHsas2j8Dqa3TdGphZq/Vessel_XXXX.png`

The filename is case-sensitive. D13.1 confirmed the actual IPFS directory uses capital `Vessel_`.

The metadata must include `Born Rarity` from the assigned manifest item so the Reveal-aware viewer can exercise rarity parsing.

The exact production description text is intentionally not invented in this specification. Metadata generation must preserve an approved source description/template when D16 is performed.

## Public verification inputs

A verifier needs only:

- frozen manifest;
- canonicalization rules;
- provenance transaction hash;
- onchain provenance value;
- provenance receipt block;
- seed block `P + 20`;
- seed block hash;
- assignment algorithm.

Anyone should be able to reproduce the same 1..10 assignment independently.

## Safety boundary

No private key is required for manifest hashing, seed derivation, assignment, or verification.

Only the owner-side `commitProvenance` and later `reveal` transactions require signing, and those remain operator/agent actions.

Do not use this 10-item rehearsal provenance hash or seed as the final mainnet 3,232 collection provenance/randomness commitment.
