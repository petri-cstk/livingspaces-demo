# Personalization Brief — Living Spaces

> Produced by personalization-strategist (Phase 2), auto-generated for a home-furniture retailer and
> aligned to requirement #4: *"Create and manage audiences based on context such as region, device,
> category, cookies, or externally supplied audience data."* On-site story only (CMS + Personalize +
> on-site Lytics). Cross-channel Lytics is out of scope (see bottom).

## 1. The story in one paragraph

Living Spaces sells the same catalog to very different shoppers, and the homepage should meet each one
where they are. A visitor in a warm Sunbelt market lands on **Outdoor Living**; a shopper who's been
browsing mattresses sees the **Sleep Center** lead; someone on a phone gets a store-pickup/financing-first
layout; a returning visitor is welcomed back and steered to continue where they left off; and a
**trade/designer** identified from externally-supplied audience data drops into a **Trade Program /
Contract Grade** experience. Every one of these is composed and managed in the CMS via Contentstack
Personalize, keyed on context signals — **region, device, category affinity, cookies, and external
audience data** — the exact five the requirement calls out, with no change to the product catalog.

## 2. Audiences (shared definitions)

| Audience | Definition (attributes / conditions) | Entry signal |
|----------|--------------------------------------|--------------|
| **Sunbelt / Warm region** | `region ∈ {CA, AZ, NV, TX, FL}` (from geo/zip) | IP geo or entered ZIP (the header ZIP, e.g. 39180) → `region` attribute |
| **Northern / Cool region** | `region ∈ {WA, OR, CO, IL, NY, …}` | IP geo or entered ZIP |
| **Mobile shopper** | `device = mobile` | User-agent / viewport at session start → `device` attribute |
| **Bedroom & Sleep intent** | `category_affinity = bedroom\|mattress` (≥1 category/product view) | `category_view` / `product_view` in Bedroom or Mattresses |
| **Living & Seating intent** | `category_affinity = living_room` | `category_view` / `product_view` in Living Room |
| **Returning visitor** | `is_returning = true` (cookie present, prior session) | Personalize/Lytics cookie on 2nd+ visit |
| **Trade / Designer (external)** | `audience = trade_pro` supplied by external audience data | External audience import (CDP/ad-platform segment) → Personalize custom attribute |

> Field/attribute names (`region`, `device`, `category_affinity`, `is_returning`, `audience`) are the
> shared contract — identical across the Personalize experiences (Phase 4) and the on-site Lytics
> tracking (Phase 5). Define once.

## 3. On-site personalization (Contentstack Personalize)

| Experience | Type | Audience | Pages / blocks | Variant intent |
|-----------|------|----------|----------------|----------------|
| **Regional hero steer** | Segmented | Sunbelt vs Northern region | Home hero + promo strip | Sunbelt → "Outdoor Living / Create your oasis"; Northern → "Cozy Season / sectionals & rugs" |
| **Category-affinity feature** | Segmented | Bedroom&Sleep vs Living&Seating | Home mid-page feature band | Bedroom → Sleep Center (mattresses); Living → Modular Sectionals feature |
| **Device-aware layout** | Segmented | Mobile shopper | Home hero / service band | Mobile → store-pickup + Financing surfaced first, condensed hero CTA |
| **Trade / Designer** | Segmented | Trade Pro (external data) | Home hero + nav emphasis | Lead with Trade Program + Contract Grade; B2B value props |
| **Returning-visitor welcome** | Segmented | Returning visitor | Home hero ribbon + recs | "Welcome back" + "Continue shopping" recommendations |
| **Hero message A/B** | A/B | all | Home hero | Editorial "Feast Your Eyes" vs value "Shop Summer Deals" — measure CTR |

- **Journey coverage:** the region and category-affinity experiences also carry to the **PLP** (category
  CMS content block, requirement #2) and the homepage promo tiles, so the steer is consistent beyond the
  hero — not homepage-only.

## 4. On-site behaviors that must fire (for lytics-behavioral-tracking-agent)

- `page_view` (with `region`, `device` context)
- `category_view` (category name → drives `category_affinity`)
- `product_view`
- `add_to_cart`, `add_to_wishlist`
- `store_locator_view`, `financing_view` (device/intent signals)
- `catalog_view`
- `trade_program_view` (supports the trade audience on-site; external import is the primary entry)
- `region_detected` (from ZIP entry / geo)

Segmented experiences also key on Personalize custom attributes set on-site (`region`, `device`,
`category_affinity`, `is_returning`) and the externally-imported `audience = trade_pro`.

## 5. Open items for the SE to confirm

- [ ] Real page URLs (curl-checked) once the rebuild lands — home `/`, PLPs `/plp/<category>`, PDPs `/pdp/<id>`.
- [ ] Which state list defines "Sunbelt" vs "Northern" for the demo narrative.
- [ ] The external audience-data source to reference for the Trade/Designer segment (name only — the
      demo simulates the import; no real customer data).
- [ ] Confirm device targeting granularity (mobile vs tablet vs desktop) for the demo.

---

## Advanced Lytics (cross-channel) — out of scope here

Cross-channel journeys / multi-channel activation are built in the **Demo Studio** tool
(<https://customerdatabox-frontend-884617549908.us-central1.run.app/demo-studio/start>) and the
**DemoStudioConfiguration** repo. The §2 audiences are a clean starting point if that's ever needed,
but this demo stays on-site (CMS + Personalize + on-site Lytics).
