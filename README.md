# NULL RITE — Web

Next.js 14 + TypeScript + wagmi/viem + WalletConnect transport for the NULL RITE website.

Current public phase: **pre-launch / Public Summoning sealed / Reveal sealed / Gate sealed**.

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
- wagmi + viem
- Custom NULL RITE wallet modal
- injected / EIP-6963 wallets
- WalletConnect mobile / QR fallback
- TanStack Query
- Robinhood Chain
- Cloudinary for website media delivery
- Vercel for deployment

## Public launch state

- Supply concept: 3232 VESSELS
- Public Summoning: SEALED
- Reveal: SEALED
- Gate: SEALED
- $RITE: SEALED
- Development mint plumbing remains in the codebase but is not exposed by the public pre-launch UI.

## Runtime network

Network and Vessel contract selection are centralized. Components must not hardcode testnet/mainnet IDs or contract addresses.

```text
NEXT_PUBLIC_NULLRITE_NETWORK=testnet
NEXT_PUBLIC_NULLRITE_ADDRESS=<contract for selected network>
```

`testnet` is the safe default while release-candidate testing is in progress. Mainnet must be selected explicitly after the production Vessel contract has been deployed and approved.

## Wallet connection

The public wallet flow is:

```text
Connect Wallet
→ custom NULL RITE wallet modal
→ injected wallet or WalletConnect
→ wallet session restored on return when supported
→ no forced network switch during pre-launch connection
→ switch only when an onchain action requires the runtime chain
```

OKX, Rabby, MetaMask and other compatible injected wallets are discovered through wagmi. Mobile WalletConnect handoff requires a valid Reown Project ID.

### Required Reown variable

Create a project in Reown Dashboard and set:

```text
NEXT_PUBLIC_REOWN_PROJECT_ID=<real Reown Project ID>
```

Configure the Reown project for the domains that will host NULL RITE, including the current Vercel preview domain during testing and `nullrite.xyz` before custom-domain launch.

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

Public environment variables can include:

```text
NEXT_PUBLIC_NULLRITE_NETWORK
NEXT_PUBLIC_NULLRITE_ADDRESS
NEXT_PUBLIC_REOWN_PROJECT_ID
NEXT_PUBLIC_IPFS_GATEWAY
```

Do not store private keys, seed phrases, or server-side secrets in `NEXT_PUBLIC_*` variables because they are exposed to the browser.

## Current routes

The current visual build uses hash-based route panels:

```text
#/collection
#/gate
#/docs
```

These can later be migrated to dedicated Next.js routes without redesigning the page content.

## Media

Website media is delivered through Cloudinary. URLs are centralized in:

```text
lib/siteConfig.ts
```

## Still intentionally incomplete

The following are future phases and should not be treated as live functionality yet:

- mainnet Vessel mint opening
- final production Vessel contract address
- reveal metadata switch
- final IPFS collection CID
- live $RITE token actions
- Gate engine
- persistent Gate Record backend

## Launch rule

Public wallet connection may be live before mint. Public Summoning remains sealed until the production contract and launch time are approved. Opening Summoning must not expose development/test state as the production mint.
