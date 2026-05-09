import type { Metadata } from "next";
import { STORE, todayCloseLabel } from "@/lib/store";
import { getActiveDeals, getTreasureChestProducts } from "@/lib/db";
import { fetchClosureStatus } from "@/lib/closure-status";
import { JaneMenu } from "./JaneMenu";
import { MenuFallback } from "./MenuFallback";
import { MenuLocalStrip } from "@/components/MenuLocalStrip";
import { MenuActiveDealsStrip } from "@/components/MenuActiveDealsStrip";
import { ClosureBanner } from "@/components/ClosureBanner";
import { VendorAdSlot } from "@/components/VendorAdSlot";
import { safeJsonLd } from "@/lib/json-ld-safe";

// /menu = iHeartJane Jane Boost (iframeless) embed. Customer stays on
// seattlecannabis.co — the Boost JS module hydrates the menu inline.
// Naive iframe is blocked (iHeartJane sets X-Frame-Options: SAMEORIGIN).
//
// Config + script tags live in JaneMenu.tsx. Seattle's embedConfigId 222
// was recovered from a 2023-09-21 web.archive.org snapshot of
// www.seattlecannabis.co/menu (back when the site ran on the older
// `frameless_embeds` runtime). The numeric ID survived iHeartJane's
// migration to Boost; storeId 5295 + embedConfigId 222 authorizes this
// store under the current Boost runtime.

// Was force-static (embed config is static), now ISR 60s so MenuFallback
// can show the most-urgent active deal without losing the cache benefit.
// One getActiveDeals() call per minute per region — negligible.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Cannabis Menu — Live Inventory",
  description: `Live cannabis menu at ${STORE.name} in ${STORE.address.city}, WA. Flower, pre-rolls, vapes, concentrates, edibles, tinctures, and topicals from 100+ Washington-state producers. Order ahead for cash pickup. 21+, ID required.`,
  alternates: { canonical: "/menu" },
  openGraph: {
    title: `Cannabis Menu | ${STORE.name}`,
    description: `Live cannabis menu — prices, THC/CBD, lab data. ${STORE.address.full}.`,
    url: `${STORE.website}/menu`,
    type: "website",
    // Next 16 metadata cascade quirk: page-level `openGraph: {...}` fully
    // REPLACES parent's auto-injected images. Without this, /menu share
    // previews render imageless. glw has `app/menu/opengraph-image.tsx`
    // (per-route image) which Next auto-injects despite the override; scc
    // never grew that file, so we reference the root /opengraph-image
    // directly. Sister of v8.745 fix on /order /careers /heroes /blog.
    images: ["/opengraph-image"],
  },
  // Partner-presence signal the WP plugin emits. The WP origin (208.109.64.51)
  // shipped <meta name="jane:version" content="1.4.7"/> on every /menu page;
  // our Vercel deploy doesn't, and that's the lone Jane-touching DOM diff
  // between WP (where Boost works) and Vercel (where the API CORS-rejects).
  // Untested hypothesis but a safe one-liner to flush from the diagnosis tree.
  // See ~/Documents/CODE/MENU_LOG.md hypothesis #5.
  other: { "jane:version": "1.4.7" },
};

const IHEARTJANE_STORE_ID = 5295;
const IHEARTJANE_EMBED_CONFIG_ID = 222;

// Server-side prewarm — touches iHeartJane's edge cache for this store's
// Dutchie-backed `menu_products` query BEFORE the page response reaches
// the customer. Reason: Boost runs `afterInteractive`, which means the
// browser doesn't query the same URL until after Next hydration completes.
// If Dutchie's API hadn't been hit recently for this store, the cold-start
// can take 8-15s — long enough that `MenuFallback`'s 6s watchdog flips
// the amber "menu is taking a moment to load" panel even though Boost is
// just-about to succeed. Doug 2026-05-04 confirmed this matches the
// "menu error coming up first pass" customer report. See MENU_LOG.md +
// MenuFallback.tsx FALLBACK_AFTER_MS for the visible threshold this
// dodges. Mirror of greenlife-web's prewarm.
//
// Best-effort + non-blocking: 1.5s AbortSignal timeout caps the impact on
// /menu TTFB if Jane/Dutchie is unreachable. Failure silently swallowed.
async function prewarmDutchieMenu(): Promise<void> {
  try {
    await fetch(
      `https://api.iheartjane.com/api/v1/stores/${IHEARTJANE_STORE_ID}/menu_products?per_page=1`,
      { signal: AbortSignal.timeout(1500), cache: "no-store" },
    );
  } catch {
    // expected: timeout, Jane down, network blip — page render proceeds
  }
}

export default async function MenuPage() {
  // PWA-install detection — cookie set by /api/track-install on first
  // standalone-mode launch. Same gate as /deals + homepage strip. Without
  // this, installed visitors saw the same `app_only=false` deal subset
  // as browser-only visitors — losing the install incentive on the most-
  // visited customer page. Sister of glw v4.745.
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const isInstalled = cookieStore.get("scc_pwa_installed")?.value === "1";
  const [deals, closure, treasureChest] = await Promise.all([
    getActiveDeals({ includeAppOnly: isInstalled }).catch(() => []),
    fetchClosureStatus(),
    getTreasureChestProducts(60).catch(() => []),
    prewarmDutchieMenu(),
  ]);
  const featuredDeal = deals[0] ?? null;
  const treasureChestCount = treasureChest.length;

  // CollectionPage + ItemList of menu categories. Boost holds the live
  // product data inside its iframe-less embed so we can't expose per-
  // product LD; what we CAN expose is the canonical category set so
  // Google understands /menu is a structured collection. Earns site-
  // link / category-carousel eligibility on the SERP. Sister glw v7.485.
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${STORE.website}/menu#collection`,
    name: `${STORE.name} cannabis menu`,
    description: `Live cannabis menu at ${STORE.name} — flower, pre-rolls, vapes, concentrates, edibles, tinctures, topicals, accessories.`,
    url: `${STORE.website}/menu`,
    isPartOf: { "@id": `${STORE.website}/#website` },
    about: { "@id": `${STORE.website}/#dispensary` },
    mainEntity: {
      "@type": "ItemList",
      name: "Cannabis menu categories",
      numberOfItems: 8,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Flower", url: `${STORE.website}/menu#flower` },
        { "@type": "ListItem", position: 2, name: "Pre-rolls", url: `${STORE.website}/menu#pre-rolls` },
        { "@type": "ListItem", position: 3, name: "Vapes", url: `${STORE.website}/menu#vapes` },
        { "@type": "ListItem", position: 4, name: "Concentrates", url: `${STORE.website}/menu#concentrates` },
        { "@type": "ListItem", position: 5, name: "Edibles", url: `${STORE.website}/menu#edibles` },
        { "@type": "ListItem", position: 6, name: "Tinctures", url: `${STORE.website}/menu#tinctures` },
        { "@type": "ListItem", position: 7, name: "Topicals", url: `${STORE.website}/menu#topicals` },
        { "@type": "ListItem", position: 8, name: "Accessories", url: `${STORE.website}/menu#accessories` },
      ],
    },
  };

  // BreadcrumbList — earns SERP path rendering (Home › Menu).
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Menu", item: `${STORE.website}/menu` },
    ],
  };

  return (
    <div className="bg-stone-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
        <VendorAdSlot slot="menu_top" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-3">
        <ClosureBanner closure={closure} />
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">Live Menu</h1>
        <p className="text-sm text-stone-600">
          Real-time inventory from {STORE.name}. Pickup orders open daily 8 AM–
          {todayCloseLabel()}. Cash only at the counter, 21+ with valid ID.
        </p>
        {/* Vendor / house ad — sidebar-style banner above the Boost embed.
            Slot key matches admin curation surface (placement_slot='menu_sidebar'). */}
        <VendorAdSlot slot="menu_sidebar" />
      </div>
      <JaneMenu storeId={IHEARTJANE_STORE_ID} embedConfigId={IHEARTJANE_EMBED_CONFIG_ID} />
      <MenuActiveDealsStrip deals={deals} treasureChestCount={treasureChestCount} />
      <MenuFallback featuredDeal={featuredDeal} />
      <MenuLocalStrip />
    </div>
  );
}
