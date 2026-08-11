import { initializePersonalize } from "@/lib/cspersonalize";

/**
 * Dual-tracks a key on-site behavioral event (product_view, add_to_cart, …)
 * to Contentstack Personalize via the edge SDK's `triggerEvent`, so
 * segmented/A-B experiences get an immediate conversion signal.
 *
 * Deliberately server-side: it reuses the SAME env vars + edge SDK already
 * initialized per-request in middleware.ts (CONTENTSTACK_PERSONALIZATION /
 * CONTENTSTACK_PERSONALIZE_EDGE_API_URL), instead of exposing the Personalize
 * project uid or SDK to the browser bundle. Client callers only need an
 * event key — see `triggerPersonalizeEvent()` in lyticsTracking.js.
 *
 * No-ops (200, {skipped:true}) when Personalize isn't configured — this must
 * never break the primary Lytics tracking call it's dual-tracked alongside.
 */
export async function POST(request) {
  try {
    const { eventKey } = await request.json();
    if (!eventKey || typeof eventKey !== "string") {
      return Response.json({ error: "eventKey is required" }, { status: 400 });
    }

    const projectUid = process.env.CONTENTSTACK_PERSONALIZATION;
    const { personalize } = await initializePersonalize(
      request,
      process.env.CONTENTSTACK_PERSONALIZE_EDGE_API_URL,
      projectUid
    );

    if (!personalize || typeof personalize.triggerEvent !== "function") {
      return Response.json({ skipped: true });
    }

    await personalize.triggerEvent(eventKey);

    const response = Response.json({ ok: true });
    personalize.addStateToResponse?.(response);
    return response;
  } catch (error) {
    console.error("[personalize/trigger-event] failed:", error);
    // Dual-tracking is best-effort — never surface this as a hard failure to
    // the client, it would otherwise look like the primary event failed too.
    return Response.json({ skipped: true, error: String(error?.message || error) });
  }
}
