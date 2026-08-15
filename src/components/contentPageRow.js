"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ContentstackClient } from "@/lib/contentstack-client";
import { inLivePreview } from "@/utils/lp";

// Normalize a category name / taxonomy term to a comparable key.
const norm = (s) =>
  (s || "").toString().toLowerCase().trim().replace(/[\s&/-]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");

/**
 * ContentPageRow
 * Auto-surfaces any `page` entry tagged (Product Category taxonomy) with the
 * current PLP's commerce category — as an "Ideas & Inspiration" card row.
 * New tagged pages appear automatically; nothing to wire per-page.
 */
export default function ContentPageRow({ category, locale }) {
  const [pages, setPages] = useState([]);

  useEffect(() => {
    // Don't run this cross-entry `page` fetch inside Visual Builder / Live Preview.
    // In preview, getElementByType fetches OTHER entries against the PLP's edit hash
    // and calls addEditableTags on them; that foreign-entry activity makes VB lose
    // track of the PLP entry it's editing and locks the whole page. The row is
    // derived, non-editable content — skip it while editing (it still shows live).
    if (inLivePreview()) {
      setPages([]);
      return;
    }
    // The PLP's category.name is the entry headline ("Living Room Furniture"),
    // while category.url is the clean commerce slug ("/living-room" -> living_room).
    const catUrl = norm(category?.url);
    const catName = norm(category?.name);
    if (!catUrl && !catName) {
      setPages([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await ContentstackClient.getElementByType("page", locale);
        const list = Array.isArray(data) ? data : data?.entries || [];
        const hits = list
          .filter((p) =>
            p?.url &&
            (p?.taxonomies || []).some((t) => {
              const term = norm(t?.term_uid || t?.uid || t?.term);
              return term && (term === catUrl || term === catName || catName.includes(term));
            })
          )
          .map((p) => {
            const heroBlock = (p.modular_blocks || []).find((b) => b && b.hero);
            return { title: p.title, url: p.url, image: heroBlock?.hero?.image?.url || "" };
          });
        if (!cancelled) setPages(hits);
      } catch (e) {
        if (!cancelled) setPages([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category?.name, category?.url, category?.id, locale]);

  if (!pages.length) return null;

  return (
    <section className="max-w-8xl mx-auto px-8 py-12 border-t border-gray-200">
      <h2 className="text-center tracking-widest uppercase text-neutral-700 mb-2">Ideas &amp; Inspiration</h2>
      <p className="text-center text-neutral-500 mb-8">
        Guides and tips to bring your {category?.name || "space"} to life.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pages.map((p, i) => (
          <Link key={p.url || i} href={p.url} className="group block border border-gray-200 bg-white shadow-sm overflow-hidden">
            {p.image && (
              <div className="h-[220px] overflow-hidden bg-cream">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
            )}
            <div className="p-5">
              <h3 className="text-brand font-semibold leading-snug mb-2">{p.title}</h3>
              <span className="text-sm tracking-widest uppercase text-brand group-hover:text-brand-dark">Read the guide →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
