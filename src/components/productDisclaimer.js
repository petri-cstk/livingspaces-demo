"use client";
import { useEffect, useState } from "react";
import { ContentstackClient } from "@/lib/contentstack-client";

// Normalize a category name / taxonomy term to a comparable key.
// "Living Room" -> "living_room", "Dining" -> "dining"
const norm = (s) =>
  (s || "").toString().toLowerCase().trim().replace(/[\s&/-]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");

/**
 * ProductDisclaimer
 * Auto-renders any `product_disclaimer` entry whose Category taxonomy term
 * matches one of the PDP product's Red Panda Commerce categories.
 * Rendered at the bottom of the PDP.
 */
export default function ProductDisclaimer({ product, entry, locale }) {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    // Match on BOTH the commerce product's category (commerce-backed PDPs) AND
    // the CMS pdp entry's own taxonomy term(s) (author-created PDPs that set the
    // Product Category taxonomy directly on the entry).
    const cats = [
      ...(product?.categories || []).map((c) => norm(c?.name || c?.url || c)),
      ...(entry?.taxonomies || []).map((t) => norm(t?.term_uid || t?.uid || t?.term)),
    ].filter(Boolean);
    if (!cats.length) {
      setMatches([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await ContentstackClient.getElementByType("product_disclaimer", locale);
        const list = Array.isArray(data) ? data : data?.entries || [];
        const hits = list.filter((d) =>
          (d?.taxonomies || []).some((t) => cats.includes(norm(t?.term_uid || t?.uid || t?.term)))
        );
        if (!cancelled) setMatches(hits);
      } catch (e) {
        if (!cancelled) setMatches([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [product?.id, product?.uid, JSON.stringify(product?.categories || []), JSON.stringify(entry?.taxonomies || []), locale]);

  if (!matches.length) return null;

  return (
    <section className="max-w-4xl mx-auto px-8 py-10 border-t border-gray-200">
      {matches.map((d, i) => (
        <div key={d?.uid || i} className={i > 0 ? "mt-6" : ""}>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-brand mb-2" {...d?.$?.title}>
            {d?.title}
          </h3>
          <p
            className="text-sm text-neutral-500 leading-relaxed whitespace-pre-wrap"
            {...d?.$?.disclaimer_text}
          >
            {d?.disclaimer_text}
          </p>
        </div>
      ))}
    </section>
  );
}
