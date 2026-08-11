# Living Spaces — Demo Status

A Red Panda Resort v2 (`release/4.3.2`) instance rebranded into **Living Spaces**, a premium
home-furniture & décor retailer, with the homepage rebuilt from modular blocks to mirror
livingspaces.com and the five customer requirements built or prepared.

## Run it

```bash
cd demos/livingspaces && npm install && npm run dev   # http://localhost:3000/en
```

Env: `demos/livingspaces/.env.local` (points at the SE's stack, `dev` environment).

## What was built

**Homepage** — rebuilt from Red Panda modular blocks to mirror livingspaces.com, 100% CMS-driven,
using the `livingspaces` assets folder:
- Clean text-free lifestyle **hero** (CMS-driven headline "Summer, Brought to Life" + CTA — personalizable)
- 3-column **promo strip** (`cards`): Summer Deals / Outdoor Living / New Arrivals
- **Shop by Room** (`image_grid` mosaic): Living Room, Bedroom, Dining, Home Office, Outdoor, Kids + Teens
- **The Sleep Center** + **Nate + Jeremiah** feature bands (`text_and_image`)
- **Your Style, Brought to Life** UGC gallery (`image_grid`)
- **Shop by Style** (Coastal, Cottage, Traditional, Scandinavian, Modern, Boho)
- **Shop by Collection** (Crypton, Flexsteel, Dean, Jolene, Alton, Pierce, Luca, Jaxon)
- **Editorial** row (`article_banner`, 3 re-authored décor articles) + **service band** (`cards`)

**Brand** — `config` fonts set to **Cormorant** (headings) / **Open Sans** (body) / **Raleway** (buttons);
palette re-themed in `globals.css` + a full sweep of the hardcoded `cyan-600` accent → near-black
`brand` token (0 remaining) + LS red accent `#C8102E`; forms restyled (visible borders, solid buttons);
`LIVING SPACES` wordmark logos (light + dark SVG) wired into the `header` singleton; nav = furniture
categories; all static resort brand strings de-resorted.

## The five requirements

| # | Requirement | Status | Where |
|---|-------------|--------|-------|
| 1 | **PDP category disclaimer** | ✅ Built (per-PDP, rendered) + scalable pattern documented | PDP description callout; scalable = a small `pdp/[id]/page.js` hook fetching one CMS disclaimer entry per category (see below) |
| 2 | **PLP CMS content around grid, category-targeted** | ✅ Built | PLP `modular_blocks_top` (merchandising banner) + `modular_blocks_bottom` (SEO buying guides); base already supports these slots, product-listing logic untouched |
| 3 | **Page preview of scheduled changes** | ✅ Supported (platform) | Live Preview wired (`LIVE_PREVIEW_ENABLED=true` + preview token). Demo the scheduled-change preview via **Contentstack Releases / Scheduled Publishing + Live Preview** in the CMS UI — no sandbox-page duplication |
| 4 | **Personalization by context** (region/device/category/cookies/external) | ✅ Built & live | 3 preset-based audiences (Warm/Cool **Region**, **Mobile** device — auto-resolved, zero site instrumentation) + segmented "Living Spaces — Shopper Context" hero experience + "Living Spaces Hero A/B" test; stock resort experiences/audiences/variant-groups de-resorted (zero orphans) |
| 5 | **PDP content enrichment over commerce** | ✅ Built | PDP `description` override ("Editor's Note — CMS-enriched") sits over the denormalized commerce snapshot (`entry.X ?? product.X`); authors enrich in the CMS with no import job |

## Personalization (req #4) — built & live

Project `6a79ce19a1c13765146fbd23`. Built with a Living-Spaces copy of the source-aware rebuild tool
(run from the scratchpad so it never lint-breaks the deploy build — see base issue #13):
- **Audiences (preset-based → auto-resolved, no site code):** Warm-Climate Region + Cool-Climate Region (`REGION` preset), Mobile Shopper (`DEVICE_TYPE` preset). These personalize live out of the box.
- **Segmented experience** "Living Spaces — Shopper Context": Warm → Outdoor Living hero, Cool → Cozy Living hero, Mobile → shop-&-pickup hero (entry variants on the homepage `hero_banner`, published `dev`, `api_version 3.2`).
- **A/B experience** "Living Spaces Hero A/B": Control vs Editorial ("Feast Your Eyes") vs Value ("Summer Sale").
- **De-resorted:** the 4 stock resort experiences + their orphaned CMS variant groups + 7 stock resort audiences — zero orphans in the Visual Builder dropdown.
- **App wiring:** `CONTENTSTACK_PERSONALIZATION` set to the project UID (was the `true` placeholder) so the middleware serves variants. Restart the dev server after any env change (the `CONTENTSTACK_*` vars are build-time inlined).

To extend (e.g. add category-affinity or a trade/external audience via a custom attribute or a Lytics audience), edit the CONFIG and re-run; it's idempotent by name.

## Lytics

**On-site tracking — LIVE.** `LYTICS_TAG` is valid (verified: the tag script loads, `window.jstag` is
active, and profile/segment resolution calls to `c.lytics.io` already fire with device/URL context).
On-site behavioral events for the journey (category_view / product_view / add_to_cart / …) were
centralized through `useJstag()` — see the tracking pass in `src/context/lyticsTracking.js` + surfaces.

**CDP schema/segments — blocked on the correct API token.** The provided `LYTICS_API_KEY` returns 401
(all auth methods). `tools/lytics-schema.js` needs the **`at.{hash}.{hash}`** full-access token from
**Lytics → Account → Manage → Access Tokens** (the value provided is not that format). Once it's set:
```bash
ENV_FILE=demos/livingspaces/.env.local node tools/lytics-schema.js   # edit CONFIG first: region/device/category-affinity/returning/trade fields + segments
```
`LYTICS_COLLECTION_ID` is optional (content recommendations only).

## Known remaining cleanup (non-blocking, secondary surfaces)

- **de/fr/es locales** still carry stock resort copy (EN is fully de-resorted). Re-author or remove unused locales.
- **~36 hardcoded foreign image URLs** on non-featured pages (`dams/*`, `deals`, `faq`) — replace/remove if those pages are shown.
- **4 `href="#"`** dead-end anchors on `section/*` + `faqs/*` pages (not on home/PLP/PDP).
- **Article bodies** for the 3 featured décor articles have de-resorted titles/teasers/images; their long-form bodies can still be de-resorted.
- **Base bug filed:** #139 — PDP `modular_blocks` allows `long_text` but page.js only renders `text_block`; the PDP disclaimer/care content was folded into the rendered `description` as the workaround.

## Deploy

The demo runs on `dev`. To deploy to the Launch environment the deployment dashboard already created,
run `/deploy` (zip upload or connect a GitHub repo). Set the Personalize + env vars in the Launch UI
and publish content/assets to the target environment first.
