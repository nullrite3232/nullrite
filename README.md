# NULL RITE — Web (Vercel-ready scaffold)

Next.js (App Router) + TypeScript + wagmi/viem/RainbowKit on Robinhood Chain.
V1 spec: MASTER CONCEPT SPEC V1 (sealed Gate, pre-reveal, static + mocked).

## Stack
- Framework: Next.js 14 (App Router)
- Wallet: wagmi + viem + RainbowKit (custom RH Chain, chainId 4663)
- Deploy: Vercel (free `*.vercel.app`; custom domain nullrite.xyz addable)

## Local dev
```
npm install
npm run dev
```

## Env (Vercel project settings → Environment Variables)
- `NEXT_PUBLIC_NULLRITE_ADDRESS` = deployed ERC721 address (after contract ready)
- `NEXT_PUBLIC_IPFS_GATEWAY`     = e.g. https://ipfs.io/ipfs/

## Deploy to Vercel (free domain)
1. Buat repo GitHub kosong, mis. `nullrite-web`.
2. Di VPS:
   ```
   cd nullrite-web
   git init
   git add -A
   git commit -m "scaffold"
   git remote add origin git@github.com:<user>/nullrite-web.git
   git push -u origin main
   ```
3. vercel.com → "Add New" → import repo `nullrite-web`. Framework auto-detect = Next.js.
4. Dapet domain `nullrite-web.vercel.app`. Custom domain `nullrite.xyz` bisa di-add gratis.
5. Isi env var → Redeploy.

## What's built now (pre-contract, per spec §24)
- Home (/), Mint (/mint), Collection (/collection), Gate (/gate), Docs (/docs)
- All config centralized in lib/siteConfig.ts (supply, states, terminology)
- Mint/collection/reveal are MOCKED until contract ready (§24)

## Blocked until contract (§28 TBA)
- Real mint tx (need contract address + ABI)
- Live supply counter
- Reveal metadata switch (need IPFS + reveal mechanic)
- $RITE system
- Live Gate engine

## Upload / Pinata note
- 3,232 Vessel PNGs ≈ ~5 GB total → Pinata FREE (1 GB) NOT enough → need Picnic ($20/10 GB).
- Reveal pattern (§12): pre-mint tokenURI → Sealed placeholder; post-reveal → real metadata.
- Sealed Vessel placeholder image must be created (§5) — not in asset folder.
- Metadata.json (born traits) TBA — generate later.
