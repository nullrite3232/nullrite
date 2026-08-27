# VesselNFT Testnet Release Candidate

Status: **Phase B testnet RC**

This contract is the production-shaped Vessel NFT contract used to rehearse NULL RITE before mainnet deployment.

## Locked production behavior

- Fixed production supply constant: `3232`.
- Token IDs are sequential starting at `1`.
- Public mint starts closed.
- The first transition to `publicMintActive=true` permanently sets `summoningStarted=true`.
- Mint price, max per transaction and max per wallet may only be configured before Summoning has ever opened.
- Per-wallet mint limit is lifetime-based through `mintedByWallet`; transferring Vessels away does not reset it.
- Mint payment must equal `mintPrice * quantity` exactly.
- Final mint automatically closes Public Summoning.
- Sold-out Assembly cannot be reopened.
- Transfers remain normal ERC-721 transfers even while Summoning is paused.
- Ownership uses OpenZeppelin `Ownable2Step`.
- Mint and withdrawal paths use `ReentrancyGuard`.

## Metadata / Reveal behavior

Before Reveal, every existing token returns the same sealed metadata URI.

After the Assembly is complete:

1. A non-zero provenance hash is committed once.
2. The provenance commitment cannot be replaced.
3. Reveal can occur only after the provenance commitment exists.
4. Reveal is irreversible.
5. Existing token IDs and ownership do not change.
6. Revealed token URI format becomes `<revealedBaseURI><tokenId>.json`.

The final public fairness mechanism still requires the separately locked reveal process: canonical 3232-item manifest, declared future seed source, deterministic assignment algorithm and public verifier. This RC provides the irreversible onchain metadata/provenance hooks; it does **not** pretend the final seed/assignment artifacts already exist.

## Test coverage

`npm run contract:test` compiles the Solidity source and executes an EVM rehearsal covering:

- sealed mint rejection;
- owner-only configuration;
- configuration lock after first opening;
- zero quantity rejection;
- per-transaction cap;
- exact-payment underpay/overpay rejection;
- sequential token IDs;
- lifetime wallet cap after transfer;
- pause/reopen behavior;
- sold-out auto-close and reopen rejection;
- provenance timing and one-time commitment;
- irreversible sealed-to-revealed metadata transition;
- ownership preservation through Reveal;
- direct ETH rejection;
- owner withdrawal;
- two-step ownership transfer.

A small test-only supply override is used by `VesselNFTTestHarness` so sold-out behavior can be exercised quickly. The production `VesselNFT` contract retains `MAX_SUPPLY = 3232`.

## Testnet deployment

The deployment helper is intentionally testnet-only and refuses any chain ID other than `46630`.

Required local variables:

```text
DEPLOYER_PRIVATE_KEY=<local only, never commit>
VESSEL_SEALED_URI=ipfs://.../sealed.json
VESSEL_MINT_PRICE_ETH=0.0001
VESSEL_MAX_PER_TX=5
VESSEL_MAX_PER_WALLET=10
```

Then run:

```bash
npm run contract:deploy:testnet
```

Deployment leaves `publicMintActive=false`. Opening Summoning is a separate owner action after the full website rehearsal is ready.
