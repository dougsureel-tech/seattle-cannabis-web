import type { MetadataRoute } from "next";
import { getActiveBrands, getActiveDeals } from "@/lib/db";
import { STORE } from "@/lib/store";
import { getPosts } from "@/lib/posts";
import { NEAR_TOWNS } from "@/lib/near-towns";

// Revalidate every 30 minutes at CDN edge — sitemap pulls from DB
// (brands, deals, posts) but those change rarely (deals daily at most;
// brands/posts even less). Pre-fix served `cache-control: public,
// max-age=0, must-revalidate` (Next.js default for metadata routes) →
// every Google/Bing/AI-bot crawl re-rendered + re-queried Postgres.
// Sister of inv v342.605 + glw v8.165 cross-repo port.
export const revalidate = 1800;

// Domains we will NEVER emit as <image:image> in the sitemap, even if
// the vendors.logoUrl DB field points at one. Per memory
// `feedback_vendor_logo_sources`: vendor logos must come from the
// brand's own site/CDN, NOT from third-party aggregators (Weedmaps,
// Leafly, etc.). Sister of glw v13.905 same fix — glw caught one
// `1555-industrial-llc` weedmaps logo via /loop tick 15 brand-page
// health audit; scc has none currently but the defensive filter
// prevents the policy violation from leaking via DB drift.
const BANNED_LOGO_DOMAINS = ["weedmaps.com", "leafly.com", "leafly.ca"];

function isBannedLogoUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return BANNED_LOGO_DOMAINS.some((banned) => host === banned || host.endsWith(`.${banned}`));
  } catch {
    return true;  // malformed → drop
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [brands, deals] = await Promise.all([
    getActiveBrands().catch(() => []),
    getActiveDeals().catch(() => []),
  ]);
  const posts = getPosts();

  const staticPages: MetadataRoute.Sitemap = [
    { url: STORE.website, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    // /menu is the iHeartJane Boost embed and customer CTAs all route
    // to it, but the brand-search ("Seattle Cannabis Co") result MUST
    // land on / not /menu. Demoted from 0.95 → 0.85 so / clearly
    // outranks in sitemap priority signaling. Pairs with the new
    // Organization + WebSite JSON-LD in app/layout.tsx anchoring / as
    // the entity hub.
    { url: `${STORE.website}/menu`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
    // /order REMOVED from sitemap — proxy.ts 307-redirects /order/* → /menu.
    // Listing redirected URLs wastes Google crawl budget. Restore when
    // proxy redirect is removed. Sister glw v7.665. (v8.805)
    { url: `${STORE.website}/deals`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    // /treasure-chest = clearance-lane surface (v5.045). Was missing from
    // the sitemap → Google never indexed it. Daily changeFrequency since
    // products move in/out as inventory turns. Sister: glw v4.825.
    { url: `${STORE.website}/treasure-chest`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${STORE.website}/find-your-strain`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    {
      url: `${STORE.website}/heroes`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // Heroes cohort SEO landings (hack #7) — capture cohort-specific
    // Seattle search traffic (veteran cannabis Rainier Valley, JBLM
    // cannabis discount, SPD weed discount, etc.). Static-rendered.
    ...["veterans", "military", "first-responders", "healthcare", "teachers"].map((slug) => ({
      url: `${STORE.website}/heroes/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    {
      url: `${STORE.website}/community`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: `${STORE.website}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${STORE.website}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${STORE.website}/visit`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${STORE.website}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    {
      url: `${STORE.website}/press`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    { url: `${STORE.website}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${STORE.website}/learn`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    {
      url: `${STORE.website}/accessibility`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${STORE.website}/careers`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${STORE.website}/terms-of-use`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${STORE.website}/health-data-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${STORE.website}/vendor-access`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${STORE.website}/apply`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    // /quiz, /stash intentionally excluded — robots:noindex (per-visitor views).
  ];

  // Dedupe brand slugs — `getActiveBrands` groups by `v.id` but the slug is
  // derived from `v.name`, so two vendor rows with the same name produce
  // the same slug. Mirror of greenlife-web/app/sitemap.ts.
  const seenBrandSlugs = new Set<string>();
  const brandPages: MetadataRoute.Sitemap = brands
    .filter((b) => {
      if (seenBrandSlugs.has(b.slug)) return false;
      seenBrandSlugs.add(b.slug);
      return true;
    })
    .map((b) => ({
      url: `${STORE.website}/brands/${b.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      // Image-extension entry — Google Image search picks the brand
      // logo as the canonical preview. Skips brands without a logo URL.
      ...(b.logoUrl && !isBannedLogoUrl(b.logoUrl) ? { images: [b.logoUrl] } : {}),
    }));

  const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${STORE.website}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt ?? p.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Per-deal deep pages — only currently-active deals, since /deals/[id]
  // 404s on expired ones and Google penalizes sitemaps with dead URLs.
  // lastModified = endDate when present so search engines see a stable
  // signal per deal rather than every-page-changes-every-day noise.
  const dealPages: MetadataRoute.Sitemap = deals.map((d) => ({
    url: `${STORE.website}/deals/${d.id}`,
    lastModified: d.endDate ? new Date(d.endDate) : new Date(),
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  // /near/<area> service-area landing pages — sister of glw v7.305.
  // Static, neighborhood-data driven from `lib/near-towns.ts`. priority
  // 0.8 — geo-search lift for "<neighborhood> dispensary" queries.
  const nearTownPages: MetadataRoute.Sitemap = NEAR_TOWNS.map((t) => ({
    url: `${STORE.website}/near/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // /near index page — hub for all /near/<area> pages, ItemList
  // JSON-LD eligible.
  const nearIndexPage: MetadataRoute.Sitemap = [
    {
      url: `${STORE.website}/near`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    },
  ];

  return [...staticPages, ...dealPages, ...brandPages, ...postPages, ...nearIndexPage, ...nearTownPages];
}
