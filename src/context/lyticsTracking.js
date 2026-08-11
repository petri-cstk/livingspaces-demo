"use client";
import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";

const snippet = `!function(){"use strict";var c=window.jstag||(window.jstag={}),a=[];function n(o){c[o]=function(){for(var n=arguments.length,t=new Array(n),r=0;r<n;r++)t[r]=arguments[r];return a.push([o,t]),c}}function t(i){c[i]=function(){for(var n=!1,t=function(){n=!0},r=arguments.length,o=new Array(r),e=0;e<r;e++)o[e]=arguments[e];return a.push([i,o,function(){return n},function(n){t=function(){n()}}]),t}}n("send"),n("mock"),n("identify"),n("pageView"),n("unblock"),n("getid"),n("setid"),n("call"),t("on"),t("once"),c.asyncVersion="3.0.37",c.loadScript=function(n,t,r){var o=document.createElement("script");o.async=!0,o.src=n,o.onload=t,o.onerror=r;var e=document.getElementsByTagName("script")[0],i=e&&e.parentNode||document.head||document.body,c=e||i.lastChild;return null!=c?i.insertBefore(o,c):i.appendChild(o),this},c.init=function n(t){return c.config=t,c.loadScript(t.src,function(){if(c.init===n)throw new Error("Load error!");c.init(c.config),function(){for(var n=0;n<a.length;n++){var t=a[n][0],r=a[n][1],o=a[n][2],e=a[n][3];if(!o||!o()){var i=c[t].apply(c,r);e&&e(i)}}a=void 0}()}),c}}();`;

export const useJstag = () => {
  // Degrade gracefully when Lytics isn't configured (no LYTICS_TAG): return a
  // no-op stub so the tag never tries to load a bad script (avoids the
  // "failed to load lytics due to invalid configuration" warning). Callers use
  // jstag.send/identify/pageView/on/getid, so the stub no-ops those.
  if (!process.env.LYTICS_TAG) {
    return {
      send() {}, identify() {}, pageView() {}, mock() {}, unblock() {},
      getid(cb) { if (typeof cb === "function") cb(null); }, setid() {}, call() {},
      on() { return () => {}; }, once() { return () => {}; },
      // Additional real-jstag methods used elsewhere in this app (header.js
      // clearCookies/resetPolling, useRecommendations/useEntity loadEntity,
      // getEntity, recommend, getSegments) — keep the stub graceful for ALL
      // call sites, not just the original short list, so a missing LYTICS_TAG
      // never throws deep in a component.
      clearCookies() {}, loadEntity(cb) { if (typeof cb === "function") cb(null); },
      getEntity() { return null; }, getSegments() { return []; },
      recommend(_opts, cb) { if (typeof cb === "function") cb([]); },
    };
  }
  if (typeof jstag === "undefined" && typeof window !== "undefined") {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.text = snippet;
    document.head.appendChild(script);

    jstag.init({
      src: `https://c.lytics.io/api/tag/${process.env.LYTICS_TAG}/latest.min.js`,
      audit: { level: "carp" }, 
      contentstack: {
        entityPush: {
          poll: {
            disabled: false,
            //initialDelay: 1000,
            //maxAttempts: 10
            //this is the most aggressive version of polling
          },
        },
      },
    });
  }
  if (typeof jstag !== "undefined") {
    return jstag;
  }
  return undefined;
};

export const useRecommendations = () => {
  const jstag = useJstag();
  const [recommendations, setRecommendations] = useState({});
  const [cstackRecs, setCstackRecs ] = useState({});
  const [queryRefresher, setQueryRefresher] = useState(1);
  const [queryTrigger, setQueryTrigger] = useState(1);
  const params = useParams();

  useEffect(() => {
    setQueryRefresher(queryRefresher + 1);
    if((queryRefresher % 3 === 0)){
      setQueryTrigger(queryTrigger + 1); // tracker to refresh lytics recommendation api query every 3 path changes
    }
  }, [params])

  const fetchRecommendations = async (id) => {
  if (process.env.LYTICS_COLLECTION_ID){try {
    const res = await fetch(`/api/recommendations/${id}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    //console.log("ran recommendations query")
    setRecommendations(data);
    console.log("recommendations from d&i api", data)
    return data;
  } catch (error) {
    console.error("Failed to fetch recommendations:", error);
  }}
};

  async function getElementsByUrls(urls, locale, references = []) {
    console.log("ran contentstack query")
  const promises = urls.map((url) => {
    return Stack.getElementByUrlWithRefs("article", `/${url?.path}`, locale, references);
  });

  try {
    const results = await Promise.all(promises);
    setCstackRecs(results);
    return results; // array of entries
  } catch (error) {
    console.error('Error fetching one or more entries:', error);
    throw error;
  }
}

  useEffect(() => {
    if (jstag) {
      jstag.getid(function (id) {
        console.log("setting cookie");
        fetchRecommendations(id);
      });
    }
  }, [queryTrigger]);
  
  useEffect(() => {
    if (recommendations?.data){
      const items = Object.values(recommendations.data).map(item => {
      const urlParts = item.url.split('/');
      const path = urlParts.slice(2).join('/'); // remove first 2 segments
      const aspect = item?.aspects?.[0] || null;

      return {
        path,
        aspect
      };
      });
      //console.log("items", items)
      getElementsByUrls(items, params?.locales, []);
    }
    
  }, [recommendations]);

  return cstackRecs
};

export const useEntity = () => {
  const jstag = useJstag();
  const [entity, setEntity] = useState(null);

  useEffect(() => {
    const off = jstag.on("entity.loaded", (_, entity) => {
      setEntity(entity);
    });
    return () => {
      off();
    };
  }, []);

  return entity;
};

export function LyticsTracking() {
  const jstag = useJstag();
  const pathname = usePathname();

  useEffect(() => {
    // Fires on every client-side route change, not just the initial load —
    // this component is mounted once in the root layout, so without the
    // `pathname` dependency jstag.pageView() only ever ran on the first
    // full page load and every subsequent SPA navigation went untracked.
    jstag.pageView();
    trackEvent(jstag, "page_view", {
      region: getRegionFromCookie(),
      device: getDeviceType(),
    });
  }, [jstag, pathname]);

  return <></>;
}

/* =============================================================================
 * Centralized tracking helpers
 * =============================================================================
 * Every intent-based event in the app should go through `trackEvent()` (and
 * PII should only ever go through `identifyUser()`, on an explicit user
 * action such as login/signup — never inside a generic `send()` payload).
 * This keeps event shape, naming, and context consistent instead of each
 * component hand-rolling its own jstag.send() call.
 * ---------------------------------------------------------------------------
 */

const SESSION_STORAGE_KEY = "ls_session_id";
const REGION_COOKIE = "ls_region";

/** Per-tab-session id (not a Lytics/Personalize id) used purely as event context. */
export function getSessionId() {
  if (typeof window === "undefined") return undefined;
  try {
    let id = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!id) {
      id =
        (window.crypto?.randomUUID && window.crypto.randomUUID()) ||
        `sess_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

/**
 * Device bucket for the brief's `device` attribute. User-agent is the
 * primary signal (available synchronously, unlike `window.innerWidth`,
 * which can read 0 for a tick during initial mount/hydration before layout
 * settles — that race misclassified an actual desktop viewport as "mobile"
 * on the very first page_view/region_detected event). Viewport width is
 * only a fallback for environments with no usable UA.
 */
export function getDeviceType() {
  if (typeof navigator !== "undefined" && navigator.userAgent) {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? "mobile" : "desktop";
  }
  if (typeof window !== "undefined" && window.innerWidth) {
    return window.innerWidth < 768 ? "mobile" : "desktop";
  }
  return undefined;
}

/** Lightweight UA sniff for the `browser` context field (best-effort only). */
export function getBrowserName() {
  if (typeof navigator === "undefined") return undefined;
  const ua = navigator.userAgent || "";
  if (ua.includes("Edg/")) return "edge";
  if (ua.includes("Chrome/")) return "chrome";
  if (ua.includes("Firefox/")) return "firefox";
  if (ua.includes("Safari/")) return "safari";
  return "other";
}

/**
 * Demo heuristic mapping a ZIP's leading digit to the two broad region
 * buckets personalization-brief.md defines (Sunbelt/warm vs Northern/cool).
 * This is intentionally coarse — the brief flags "which state list defines
 * Sunbelt vs Northern" as an open item for the SE to confirm; replace with a
 * real IP-geo lookup or a full zip/state table before a live pitch.
 */
const ZIP_PREFIX_REGION = {
  9: "sunbelt", // CA / NV / OR / WA (coarse — see note above)
  8: "sunbelt", // AZ / CO / UT
  7: "sunbelt", // TX
  3: "sunbelt", // FL / GA / AL
  2: "sunbelt", // NC / SC / VA (covers the header's demo ZIP, 28804)
  0: "northern", // CT / MA / NH
  1: "northern", // NY / PA
  4: "northern", // OH / IN / MI
  5: "northern", // IA / WI / MN
  6: "northern", // IL / MO / KS
};

export function getRegionForZip(zip) {
  const lead = String(zip ?? "").trim().charAt(0);
  return ZIP_PREFIX_REGION[lead] || "unclassified";
}

/** Cache the last-detected region in a cookie so page_view events (and any
 * other tracker) can attach `region` context without recomputing it or
 * re-reading the header's ZIP display on every call. */
export function setRegionCookie(region) {
  if (typeof document === "undefined" || !region) return;
  document.cookie = `${REGION_COOKIE}=${encodeURIComponent(region)}; path=/; max-age=2592000; SameSite=Lax`;
}

function getRegionFromCookie() {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${REGION_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/** Shared context every event carries, per the tracking standards in CLAUDE.md. */
function buildEventContext() {
  return {
    session_id: getSessionId(),
    page_path: typeof window !== "undefined" ? window.location.pathname : undefined,
    page_title: typeof document !== "undefined" ? document.title : undefined,
    device: getDeviceType(),
    browser: getBrowserName(),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Send an intent-based, snake_case event through jstag with rich, consistent
 * context. Never pass raw PII (email, phone, full name) in `props` — use
 * `identifyUser()` instead, on an explicit user action.
 */
export function trackEvent(jstag, eventName, props = {}) {
  if (!jstag || typeof jstag.send !== "function") return;
  jstag.send({
    event: eventName,
    ...buildEventContext(),
    ...props,
  });
}

/**
 * Identify a known user. Only call this on an explicit user action (login,
 * signup, profile save, checkout) — never on a generic page view or as a
 * side effect of an unrelated event.
 */
export function identifyUser(jstag, traits = {}) {
  if (!jstag || typeof jstag.identify !== "function") return;
  jstag.identify(traits);
}

/**
 * Dual-track a key event to Contentstack Personalize so segmented/A-B
 * experiences can react immediately (conversion measurement + variant
 * assignment), without exposing the Personalize project uid or SDK to the
 * browser bundle. Fires a small server route that reuses the same edge SDK
 * config already used by middleware.ts. Fire-and-forget + never throws —
 * Personalize being unconfigured must not break Lytics tracking.
 */
export function triggerPersonalizeEvent(eventKey) {
  if (typeof window === "undefined" || !eventKey) return;
  try {
    fetch("/api/personalize/trigger-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventKey }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // no-op — dual-tracking must never break the primary Lytics event
  }
}