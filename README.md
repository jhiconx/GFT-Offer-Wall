# Smith's Associate Hub - Modern PWA v2

This version preserves the original Smith's operations / CMS / checklist prototype and adds the campaign job and cash workflow shown in the supplied mobile walkthrough.

## Added in v2
- My Jobs with All / Not Started / Started / Awaiting Review states
- Jobs Available and job acceptance
- $5 campaign earning cards and deadlines
- Job detail pages
- Downloadable prototype signage PDF
- Sign placement instructions and examples
- Required placement checkboxes
- Multi-photo proof selection and previews
- Proof submission -> Awaiting Review state
- Personal notifications for jobs, submissions and payouts
- My Cash balance, pending earnings, paid/pending history and search
- Simulated bank connection flow
- Home earnings summary and active jobs

## Existing Smith's features retained
- Kroger SSO entry concept
- Home dashboard
- Store Walk / Checklist
- Voice-to-text simulation
- Photo/video attachments
- Playbooks, Standards, Merchandising, Weekly Ads and Media library
- Bulletin Board
- Rewards Wallet
- Manager/Admin CMS preview
- Rotating banners and PWA manifest/service worker

## Prototype limitations
Kroger SSO, payout rails, campaign review/approval, email delivery, CMS/backend persistence, blockchain recording and production analytics are simulated. No real credentials or money movement are collected.

## Run locally
`python3 -m http.server 8080`

Open `http://localhost:8080`.


## V3 — Cash + CHI rewards

This version adds the uploaded CHI Chili logo and a dual-reward model throughout the prototype:

- Each demo campaign shows both its cash reward and CHI count.
- My Rewards tracks total cash earned, cash pending, CHI earned, and CHI pending.
- Every reward-history row records both cash and CHI for the associate.
- Rewards Wallet displays cash and CHI side by side.
- Campaign acceptance, proof submission and payout notifications reference both reward types.
- Manager/Admin includes a Rewards view so an authorized user can see who earned what in cash and CHI.
- Campaign CMS controls include separate Cash Reward and CHI Reward fields.

The prototype uses **5 CHI per demo campaign job** only as a placeholder because no production CHI award rate was supplied. Change each job's `chi` field or connect this field to campaign configuration in production.


## Latest update

- Added a top-of-home **NEW FEATURE** spotlight for **GOT SHIFT** with the supplied logo and a direct link to `https://got-shift.vercel.app/`.


## Latest update

- Added a top-of-home **NEW FEATURE** spotlight for **OFFERWALL** above **GOT SHIFT**, with the supplied logo and direct link to `https://gft-offer-wall.vercel.app/`.

## V6 fix

- OFFERWALL is the first NEW FEATURE card on the home screen, directly above GOT SHIFT.
- OFFERWALL links to https://gft-offer-wall.vercel.app/
- GOT SHIFT links to https://got-shift.vercel.app/
- OFFERWALL, GOT SHIFT, and CHI artwork is embedded directly in index.html so the logos remain visible even when index.html is copied without its assets folder.
