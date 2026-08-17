// Local-timezone content scheduling.
//
// Contentstack's native scheduled publishing (Releases) fires at ONE global
// instant (a single UTC moment). To reveal content at "midnight in the VISITOR's
// timezone", we instead treat the go-live datetime as a WALL-CLOCK time and apply
// it in each visitor's own local zone — so the same entry flips on at local
// midnight everywhere, staggered across timezones.

// Parse an ISO string's literal Y-M-D H:M parts and build a Date in the visitor's
// LOCAL timezone. We deliberately ignore any stored offset / "Z": the marketer
// picked "2026-11-27 00:00" meaning "local midnight", and we honor those digits in
// whatever timezone the visitor is in.
export function parseLocalWallClock(iso) {
  if (!iso) return null;
  const m = String(iso).match(/(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (!m) return null;
  const [, y, mo, d, h = "0", mi = "0", s = "0"] = m;
  const dt = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s), 0);
  return isNaN(dt.getTime()) ? null : dt;
}

// The visitor's "now". For demos it can be simulated with ?tznow=<ISO> (also read
// as a local wall-clock). When simulated, the clock still ADVANCES in real time
// from that base, so you can watch the live flip: e.g. ?tznow=2026-11-26T23:59:50
// starts ~10s before local midnight and flips on its own.
export function getVisitorNow(search) {
  try {
    const raw = search ?? (typeof window !== "undefined" ? window.location.search : "");
    const sim = new URLSearchParams(raw).get("tznow");
    if (sim && typeof window !== "undefined") {
      const base = parseLocalWallClock(sim);
      if (base) {
        if (!window.__tznowAnchor) {
          window.__tznowAnchor = Date.now();
          window.__tznowBase = base.getTime();
        }
        return new Date(window.__tznowBase + (Date.now() - window.__tznowAnchor));
      }
    }
  } catch {
    /* ignore */
  }
  return new Date();
}

// Evaluate a `schedule` group against a "now". phase: disabled | before | active | after
export function getScheduleState(schedule, now = new Date()) {
  const enabled = !!schedule?.enable;
  const activateAt = parseLocalWallClock(schedule?.activate_at);
  const deactivateAt = parseLocalWallClock(schedule?.deactivate_at);
  if (!enabled || !activateAt) {
    return { enabled, active: false, phase: "disabled", activateAt, deactivateAt };
  }
  let phase = "before";
  if (now >= activateAt) {
    phase = deactivateAt && now >= deactivateAt ? "after" : "active";
  }
  return { enabled, active: phase === "active", phase, activateAt, deactivateAt };
}

export function getVisitorTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "your timezone";
  } catch {
    return "your timezone";
  }
}

// Format ms remaining as "2d 04h 09m 33s" (drops leading zero units).
export function formatCountdown(ms) {
  if (ms == null || ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  if (d > 0) return `${d}d ${pad(h)}h ${pad(m)}m ${pad(sec)}s`;
  if (h > 0) return `${h}h ${pad(m)}m ${pad(sec)}s`;
  return `${m}m ${pad(sec)}s`;
}
