# Demo Intake Brief — Living Spaces

> Filled by demo-orchestrator (Phase 1) from the customer URL + the Living Spaces requirements list.
> Fields inferred from livingspaces.com are marked _(inferred)_ — correct anything that's off.

## 0. Fastest start (what we were given)

- **Website URL:** https://www.livingspaces.com/
- **Requirements list:** 5 capabilities the demo must prove (PDP category disclaimer, PLP CMS content, Page Preview, Personalization, PDP content enrichment) — see §5.
- **Assets:** a `livingspaces` folder already exists in the stack's Assets module — use those for the rebrand.
- **In a sentence:** enterprise home-furniture & décor retailer; deep overhaul; homepage rebuilt from modular blocks to match livingspaces.com; commerce + personalization story.

## Capabilities needed (beyond the rebrand)

- **Contentstack Studio?** No _(not requested)_
- **Agent OS?** No _(not requested)_
- **Existing Agent OS to migrate?** No

## 1. Customer & brand

- **Customer / brand name:** Living Spaces
- **Industry / vertical:** Home furniture & décor retail (omnichannel — e-commerce + physical showrooms) _(inferred)_
- **Company size:** Enterprise — large multi-state US furniture retailer _(inferred)_
- **What they sell / do:** Furniture & home furnishings across Living Room, Bedroom, Mattresses, Dining, Home Office, Kids + Teens, Outdoor, Rugs, Décor _(inferred)_
- **Reference / competitor sites:** livingspaces.com (the target); tone-adjacent: West Elm, CB2, Article, Ashley _(inferred)_
- **Brand voice / tone:** Editorial, aspirational-yet-accessible, warm, design-forward. Tagline energy: "Your Style Brought to Life." _(inferred)_

## 2. Visual identity  _(all inferred from livingspaces.com)_

- **Primary color:** near-black `#1A1A1A` (text/logo/nav)
- **Secondary / accent:** sale red `#C8102E` (Clearance/deal accents)
- **Neutrals / background:** white `#FFFFFF`, warm cream/greige `#F3EFEA` / `#EBE6DF` (promo bands, section backgrounds)
- **Heading font:** high-contrast editorial serif for display (Playfair Display / Cormorant vibe — the italic "summer" wordmark); a wide-tracked light geometric sans for the logo/nav (Jost / Century Gothic vibe)
- **Body font:** clean humanist sans (Inter / Helvetica Now vibe)
- **Logo:** "LIVING SPACES" wordmark — wide letter-spacing, thin caps _(use the asset from the `livingspaces` folder if present; else set as a wordmark)_
- **Imagery direction:** bright, airy lifestyle interiors, warm natural light, styled rooms; clean silhouetted product shots on white for grids _(from the `livingspaces` assets folder)_
- **Brand guide provided?:** No — inferred from the live site.

## 3. Overhaul depth

- [x] **Heavy** — significantly different look; new homepage composition from modular blocks, furniture-retail IA, new imagery/copy throughout, ≥1 signature net-new component + ≥1 re-architected layout.
- **Must-not-look-like-a-resort:** Yes — zero resort residue; a stranger must read this as a furniture retailer.

## 4. Scope boundary

- **In scope:** Homepage (rebuilt from modular blocks to mirror livingspaces.com), header/nav + category nav, PDP, PLP, editorial/blog cards, footer, imagery + copy, fonts + colours, Personalize experiences, Lytics tracking, all locales de-resorted.
- **Out of scope / do NOT touch:** cross-channel Lytics (Demo Studio territory); provisioning a new stack (assets already live in the given stack).
- **Net-new content types expected?:** Prefer editing/extending existing types. Likely small, confirmed extensions to support the requirements: a per-category **PDP disclaimer** field/entry, a **PLP CMS content** block slot, PDP **content-enrichment override** fields. Each confirmed before creation.
- **Structural shape:** single site.
- **Depth cap:** heavy overhaul, but reuse the substrate (data layer / Personalize / Lytics / i18n / Visual Builder / modular_blocks); invent the surface.

## 5. The demo / sales narrative

- **Audience for the demo:** Living Spaces digital, e-commerce, SEO, and merchandising teams (+ IT/platform).
- **The story:** A furniture retailer's content team runs the storefront experience from the CMS — enriching PDPs, placing category-targeted merchandising on PLPs, previewing scheduled changes safely, and personalizing the homepage by context — **without** waiting on commerce-platform import jobs or engineering.
- **Primary business outcome:** Faster, self-serve merchandising + SEO velocity, and higher conversion via contextual personalization — while the commerce platform stays the system of record for the catalog.
- **Outcome direction:** growth (merchandising velocity + contextual relevance).
- **Key pages/flows:** Homepage (personalized), PLP (category-targeted CMS content), PDP (category disclaimer + SEO enrichment over a commerce snapshot), scheduled-change preview.

### The 5 requirements → how the demo proves each

| # | Requirement | How the demo shows it |
|---|-------------|-----------------------|
| 1 | **PDP category disclaimer** | CMS-managed disclaimer targeted to a product category, rendered across every PDP in that category (e.g. mattress/clearance legal text) without per-product edits. |
| 2 | **PLP CMS content, category-targeted** | A CMS block placed above/below the product grid, targetable per category, that never touches the underlying product-listing logic. |
| 3 | **Page Preview of scheduled changes** | Preview a single page's scheduled/future content before go-live (Live Preview + release/scheduled publish) — replacing the "duplicate into sandbox pages" workaround. |
| 4 | **Personalization by context** | Audiences built from region, device, category affinity, cookies, and externally-supplied audience data — driving on-site Personalize experiences. See personalization-brief.md. |
| 5 | **PDP content enrichment** | Commerce platform supplies product data (denormalized snapshot); content authors/SEO enrich PDP copy/media in the CMS on the fly — no import job or commerce-platform change. |

## 6. Personalization inputs

- **Target audiences (from the requirement — region / device / category / cookies / external):** see personalization-brief.md §2.
- **On-site personalization wanted:** homepage hero + promo steering by region and category affinity; device-aware layout; trade/designer audience (external data); returning-visitor continuity (cookie).

## 7. Logistics

- **Red Panda repo path:** `demos/livingspaces/` (cloned, `release/4.3.2`)
- **Demo lives at:** `demos/livingspaces/`
- **Stack environment:** `dev` for local build
- **Deadline:** _TBD_

## 8. Open questions / assumptions

- **BLOCKING:** stack credentials (API key + management/delivery/preview tokens + region + Personalize project UID) for the stack holding the `livingspaces` assets — needed for all CMS/asset/render work.
- Confirm the exact contents of the `livingspaces` assets folder (logo? hero lifestyle shots? product silhouettes?) — drives how much imagery is ready vs. needs sourcing.
- Confirm whether a live Red Panda Commerce store is wired (drives PDP/PLP real vs. CMS-only product grid).
- Fonts are inferred from the site; confirm exact families or accept the closest Google Fonts.
