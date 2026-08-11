"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

/**
 * Syncs the logged-in Supabase user ID to window.__RPC_CART_EMBED__.customerId.
 * embed.js watches that property via Object.defineProperty and automatically
 * calls refreshCartEmbed() whenever it changes — no manual call needed here.
 */
export default function RpcCartLinkCustomer() {
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return; // Supabase not configured — skip cart-user sync

    const sync = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (typeof window === "undefined") return;
      window.__RPC_CART_EMBED__ = window.__RPC_CART_EMBED__ || {};
      window.__RPC_CART_EMBED__.customerEmail = user?.email ?? null;
      window.__RPC_CART_EMBED__.customerId    = user?.id    ?? null;
    };

    sync();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      sync();
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
