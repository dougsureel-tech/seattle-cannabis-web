// Client-side PWA-install deal-card filter.
//
// Sister of greenlife-web's components/AppOnlyDealsFilter.tsx (v20.205).
// Same pattern, different cookie name (`scc_pwa_installed`).
//
// Background: the homepage was `cookies()`-gated to filter app-only deals
// server-side, opting the page out of CDN caching despite `revalidate=60`
// (TTFB ~456ms — slowest in the 6-site stack). Per Doug-greenlit Option (A)
// we now fetch all deals server-side (cached) and hide app-only cards
// client-side post-hydrate based on the `scc_pwa_installed` cookie.
//
// Tradeoff (accepted): non-installed customers see app-only cards for ~50ms
// between paint and hydrate before this script hides them. Flicker is the
// price of the cache hit.

"use client";

import { useEffect } from "react";

export function AppOnlyDealsFilter() {
  useEffect(() => {
    const installed =
      typeof document !== "undefined" &&
      document.cookie.split("; ").some((c) => c === "scc_pwa_installed=1");
    if (installed) return;
    const cards = document.querySelectorAll<HTMLElement>('[data-app-only="1"]');
    for (const el of cards) el.style.display = "none";
  }, []);
  return null;
}
