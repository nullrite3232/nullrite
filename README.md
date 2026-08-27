# NULL RITE — Web

Next.js 14 + TypeScript + wagmi/viem/RainbowKit for the NULL RITE website.

Current phase: **Robinhood Testnet / pre-reveal / Gate sealed**.

## Repository

GitHub repository:

```text
nullrite3232/nullrite
```

The GitHub repository name is intentionally **nullrite**.

> Note: the Vercel project may still be named `nullrite-web`. That is a separate Vercel setting and does not change the GitHub repository name.

## Stack

- Next.js 14 (App Router)
- TypeScript
- wagmi
- viem
- RainbowKit
- Robinhood Testnet for the current Summoning test flow
- Cloudinary for website media delivery
- Vercel for deployment

## Current testnet state

- Supply concept: 3232 VESSELS
- Reveal: SEALED
- Gate: SEALED
- $RITE: SEALED
- Current mint network: Robinhood Testnet (`46630`)
- Current testnet contract limits:
  - max 5 Vessels per transaction
  - max 10 Vessels per wallet
- Current testnet mint price is configured in `lib/siteConfig.ts`

## Summoning flow

The testnet mint interface now uses the real wallet/chain state:

```text
Configure quantity
→ Connect wallet if needed
→ Switch to Robinhood Testnet if needed
→ Wallet signature
→ Transaction submitted
→ Wait for receipt
→ Parse real ERC721 Transfer logs
→ Show confirmed Vessel token IDs when available
```

Prototype `Simulate Rejected`, `Signature Accepted`, and `Simulate Confirmed` controls are not part of the hardened testnet flow.

## Local development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Environment variables

Use Vercel Project Settings → Environment Variables for deployment values.

Example variables:

```text
NEXT_PUBLIC_WC_ID
NEXT_PUBLIC_NULLRITE_ADDRESS
NEXT_PUBLIC_IPFS_GATEWAY
```

Do not store private keys, seed phrases, or server-side secrets in `NEXT_PUBLIC_*` variables because they are exposed to the browser.

The current testnet contract remains configured in `lib/siteConfig.ts` while the UI is being finalized. Mainnet migration should happen only after the testnet interface is approved.

## Current routes

The current visual build uses hash-based route panels:

```text
#/collection
#/gate
#/docs
```

These can later be migrated to dedicated Next.js routes without redesigning the page content.

## Media

Website media is delivered externally through Cloudinary rather than embedded Base64 assets. URLs are centralized in:

```text
lib/siteConfig.ts
```

## Still intentionally incomplete

The following are future phases and should not be treated as live functionality yet:

- mainnet Vessel mint
- final production contract address
- reveal metadata switch
- final IPFS collection CID
- live $RITE token actions
- Gate engine
- persistent Gate Record backend

## Launch rule

Do not switch the site from Robinhood Testnet to Robinhood Chain mainnet until the testnet UI, wallet flow, contract parameters, reveal flow, and production configuration have been fully approved.
