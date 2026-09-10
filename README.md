# GFT Offer Wall

Working static PWA prototype for GitHub + Vercel.

## What the demo does

- Brand-funded promotion inbox for store managers / authorized associates
- Search and category filters
- Offer review drawer with AI-structured offer details
- Required inventory gate: In stock / Low stock / Out of stock
- Chili Rewards configuration with demo CHI shopper reward and budget
- AI-assisted campaign-build simulation
- Session-persistent demo campaigns using browser localStorage
- Final handoff button to https://admin.gftrewards.com/
- Installable PWA manifest and offline cache service worker
- Responsive desktop and mobile layouts

## Important demo boundary

All offer dates, inventory states, reward quantities, budgets, and campaign builds shown in this repository are demo values. The prototype does not write to live GFT Rewards, POS, inventory, wallet, or blockchain systems.

## Deploy to GitHub + Vercel

1. Create/open the GitHub repository named **GFT Offer Wall** and upload the contents of this folder at the repository root.
2. In Vercel, import the GitHub repository. Framework Preset: **Other**. Build Command: leave blank. Output Directory: leave blank. Deploy.

The project is plain HTML/CSS/JavaScript and requires no package install or build process.
