# Night Store

**ZK Merch Store powered by Night Markets**

Night Store lets any Night Markets project spin up a branded merch storefront in seconds. Upload a logo, pick a template, and your store is live — with revenue shared automatically to token holders every epoch. Built on Printful for fulfilment, Night Markets for revenue distribution.

---

## How it works

```
Creator                         Token Holders
   │                                  │
   ├─ Upload logo + set store name    │
   ├─ Pick template (4 options)       │
   ├─ Products auto-generated         │
   │                                  │
   ├─ Sales recorded (recordSale)     │
   │  ← 50% to epoch pool             │
   │  ← 45% to creator               │
   │  ← 5% platform fee              │
   │                                  ├─ claimRevenue()
   ├─ closeEpoch() snapshots balances │  ← NIGHT distributed pro-rata
```

---

## Features

- **Instant storefront** — logo + name → branded store in one step
- **8 default products** — hoodie, tee, sticker, cap, tote, phone case, mug, poster
- **4 store templates** — Night Dark · Neon · Minimal · Gold
- **Revenue sharing** — 50% of sales flow to token holders via Night Markets epoch system
- **Partner network** — 6 curated partner stores featured in-app
- **ZK-private claims** — holders claim revenue without revealing their balance

---

## Revenue split

| Recipient | Share |
|-----------|-------|
| Token holders | 50% |
| Creator | 45% |
| Platform | 5% |

Configurable — the split is enforced by the NightFunToken contract on Midnight Network.

---

## Products

| Item | Price |
|------|-------|
| Hoodie | $42 |
| Tee | $22 |
| Sticker pack | $9 |
| Cap | $28 |
| Tote bag | $18 |
| Phone case | $15 |
| Mug | $16 |
| Poster | $12 |

---

## Front-end

```
public/
├── index.html            Store builder + live preview
├── css/nightstore.css    Design system (plasma accent)
└── js/store.js           Store generation, product/partner rendering, revenue flows
```

Store state persisted in `localStorage` (`nst_store`). No Compact contract needed — store uses NightFunToken revenue circuits from the Night Fun module.

---

## Development

```bash
npm install
npm run dev          # Vite dev server on :3007
npm run build        # Production build → dist/
```

No `compile` script — Night Store has no on-chain contract of its own. Revenue distribution uses the NightFunToken circuit from [night-fun](https://github.com/kingmunz1994-lgtm/night-fun).

---

## Deployment

GitHub Pages via `.github/workflows/pages.yml`. Push to `main` → `public/` served automatically. To enable: **Settings → Pages → Source: GitHub Actions**.

---

## Part of Night Markets

| Repo | Description |
|------|-------------|
| [night-fun](https://github.com/kingmunz1994-lgtm/night-fun) | Core token launchpad |
| [night-work](https://github.com/kingmunz1994-lgtm/night-work) | Task marketplace |
| [night-save](https://github.com/kingmunz1994-lgtm/night-save) | Collateral vault + sUSD |
| [night-lend](https://github.com/kingmunz1994-lgtm/night-lend) | DeFi lending |
| **night-store** | **Merch store + revenue sharing** |
| [night-biz](https://github.com/kingmunz1994-lgtm/night-biz) | Business loyalty tokens |

---

*Built on Midnight Network · Powered by Printful · ZK revenue distribution*
