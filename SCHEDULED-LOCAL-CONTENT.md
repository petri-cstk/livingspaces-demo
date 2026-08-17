# Scheduled content, revealed at the visitor's LOCAL time

A hero (or any block) can carry an **alternate version** that goes live at a set
date/time **in each visitor's own timezone** — e.g. a Black Friday banner that
appears at local midnight everywhere: 00:00 in Sydney first, then Tokyo, … London,
New York, Los Angeles ~19 hours later. The same entry, staggered across the globe.

## Why this isn't just "scheduled publishing"

Contentstack's native **scheduled publishing (Releases)** fires at **one global
instant** (a single UTC moment). That's perfect for "publish this at 9am ET," but
it **cannot** do "midnight in the visitor's timezone," because that's a *different*
wall-clock moment for every visitor. So this feature keeps the scheduled version
**published ahead of time** and lets the **frontend reveal it** exactly when *that
visitor's* local clock crosses the go-live time.

> Want both? You can still wrap the whole thing in a native scheduled Release (to
> gate global availability at, say, the earliest timezone's midnight) and let this
> local gate handle the per-timezone reveal. Not required for the demo.

## How a marketer configures it (Entries → Hero Banner → *Scheduled Override*)

The `hero_banner` content type has a reusable **`schedule`** group:

| Field | Meaning |
|---|---|
| **Enable schedule** | Turn the override on/off. |
| **Go live at (visitor local)** | Wall-clock date & time. `2026-11-27 00:00` = local midnight on Black Friday, **everywhere**. The stored timezone/offset is ignored on purpose — only the digits matter. |
| **End at (visitor local, optional)** | When it reverts to the default hero (again per local zone). Empty = no end. |
| **Override headline / subhead / image / button text / button link** | The alternate hero shown during the window. |

Before "Go live" → visitors see the **default** hero. During the window → the
**override**. After "End" → back to default. All on each visitor's own clock.

The demo ships with Black Friday 2026 pre-configured on the homepage hero
(`2026-11-27 00:00` → `2026-12-01 00:00`).

## How to demo it (no waiting, no fake system clock)

Append **`?tznow=<local time>`** to the URL to simulate the visitor's local clock.
The simulated clock **advances in real time**, so you can watch the live flip:

| URL | Shows |
|---|---|
| `/en` | Default summer hero (Black Friday is months away). |
| `/en?tznow=2026-11-26T23:59:50` | Summer hero **+ a live countdown pill** ("live in 0m 41s · at your local 12:00 AM"). Wait ~a minute and it **flips to Black Friday on its own** — no reload. |
| `/en?tznow=2026-11-27T00:01` | Black Friday hero (override headline, image, "Shop the Sale" CTA). |

To tell the timezone story vividly: the countdown pill shows the visitor's detected
timezone (`Intl` API). Two people in different timezones hitting the same URL at the
same real moment see *different* states — whoever's local clock has passed midnight
sees the sale; the other still sees the countdown.

## How it's built (frontend)

- **`src/lib/localSchedule.js`** — pure helpers: `parseLocalWallClock` (reads the
  stored digits as a *local* time), `getVisitorNow` (real clock, or the `?tznow`
  simulator), `getScheduleState` (before / active / after), `formatCountdown`,
  `getVisitorTimeZone`.
- **`src/components/hero.js`** — evaluates the schedule **client-side only**
  (the server can't know the visitor's timezone). A `mounted` gate keeps SSR and the
  first client render identical (default hero) so there's **no hydration mismatch**;
  the swap happens right after mount. A 1s interval re-evaluates so the hero **flips
  live** at the local boundary and the countdown ticks — the timer only runs when a
  schedule is actually configured.
- **`src/helpers/referencePaths.js`** — resolves `hero.schedule.page` so the override
  CTA links correctly.

## Reusing the pattern elsewhere

The `schedule` group lives on `hero_banner`, so **any** hero (homepage or a PLP/page
modular block) can carry a scheduled override with zero extra code — the same Hero
component renders `hero_banner` blocks everywhere.

**Shown on two surfaces:**
- **Homepage** — the full hero swaps Summer → Black Friday.
- **Living Room PLP** (`/en/plp/living-room`) — a `hero_banner` banner-strip block in
  `modular_blocks_top` swaps a "Free Design Help & 0% Financing" promo → a "Black Friday
  — Living Room Up to 40% Off" sale banner, on each visitor's local clock. Try
  `/en/plp/living-room?tznow=2026-11-27T00:01`.

To time-gate a *different* block type (e.g. the inline `hero` block rendered by
`PageHero`), add the same `schedule` group to that content type and call
`getScheduleState()` in its renderer — the util is generic.

## Notes / trade-offs

- **Published ahead of time.** The override is in the CDA before it's visible, so a
  determined user could read it via the API early. Fine for a marketing reveal; if you
  need true embargo, combine with a native scheduled Release (above).
- **Client-side timezone.** Because SSR can't know the device timezone, a visitor who
  loads *during* the active window sees the default hero for a moment before the swap.
  It's a sub-100ms content change (same layout). For zero flash, resolve the timezone
  at the edge (middleware + geo-IP) and gate server-side instead.
