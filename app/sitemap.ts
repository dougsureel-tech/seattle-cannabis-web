import type { MetadataRoute } from "next";
import { getActiveBrands, getActiveDeals } from "@/lib/db";
import { STORE } from "@/lib/store";
import { getPosts, fetchDynamicPosts } from "@/lib/posts";
import { NEAR_TOWNS } from "@/lib/near-towns";
import { STRAIN_TYPES } from "@/lib/strain-types";
import { getStrainsInCurrentWave } from "@/lib/strains";
import { STRAIN_FAMILIES } from "@/lib/strain-families";
import { LEARN_HUB_TOPICS } from "@/lib/learn-hub";
import { isBannedLogoUrl } from "@/lib/banned-logo-url";
import { BRIEF_LIBRARY } from "@/lib/ambassador-briefs";

// Revalidate every 30 minutes at CDN edge — sitemap pulls from DB
// (brands, deals, posts) but those change rarely (deals daily at most;
// brands/posts even less). Pre-fix served `cache-control: public,
// max-age=0, must-revalidate` (Next.js default for metadata routes) →
// every Google/Bing/AI-bot crawl re-rendered + re-queried Postgres.
// Sister of inv v342.605 + glw v8.165 cross-repo port.
export const revalidate = 1800;

// Vendor-logo source-of-truth guard lives in `lib/banned-logo-url.ts` —
// shared with `app/brands/[slug]/page.tsx` since v27.885. Drops aggregator
// hosts (weedmaps/leafly) + known-404 URLs (the420bar.com, agrocouture.com)
// before they hit any customer-facing surface. Doug-action: when a vendor
// row's logoUrl gets cleaned up in Postgres, remove the corresponding URL
// from `BROKEN_LOGO_URLS` in `lib/banned-logo-url.ts`.

// Static-page lastModified — hardcoded date, not `new Date()`. Pre-fix
// every truly-static page stamped lastmod with the sitemap-build
// timestamp; Google saw "this page changed today" on every crawl,
// wasting crawl budget. Bump this constant manually when static
// content actually changes (FAQ rewrite, hours change, team-roster
// edit, etc.). Sister glw v17.505 same-fix. Doug-action #3 closure.
const STATIC_LASTMOD = new Date("2026-05-10");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [brands, deals, dynamicPosts] = await Promise.all([
    getActiveBrands().catch(() => []),
    getActiveDeals().catch(() => []),
    fetchDynamicPosts().catch(() => []),
  ]);
  const staticPosts = getPosts();
  const seenSlugs = new Set(staticPosts.map((p) => p.slug));
  const posts = [...staticPosts, ...dynamicPosts.filter((p) => !seenSlugs.has(p.slug))];

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
    { url: `${STORE.website}/find-your-strain`, lastModified: STATIC_LASTMOD, changeFrequency: "weekly", priority: 0.8 },
    // /strains directory + 4 per-type landing pages — SEO audit Tier-1
    // long-tail intent capture ("indica strains Seattle", "sativa
    // Rainier Valley", etc.). priority 0.8 — peer with /find-your-strain.
    // changeFrequency "monthly" because the descriptive copy doesn't
    // turn over (live inventory lives at /menu).
    { url: `${STORE.website}/strains`, lastModified: STATIC_LASTMOD, changeFrequency: "monthly", priority: 0.8 },
    ...STRAIN_TYPES.map((t) => ({
      url: `${STORE.website}/strains/${t.slug}`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    // Per-strain pages — gated by SEO_STRAIN_WAVE env (Doug 2026-05-15 cadence).
    ...getStrainsInCurrentWave().map((slug) => ({
      url: `${STORE.website}/strains/${slug}`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
    // Strain Family Album — /strains/families hub + 10 per-family pages.
    // Gated by SEO_FAMILY_WAVE (separate lever from SEO_STRAIN_WAVE to
    // honor the 6/day/stack cadence doctrine — 11 net-new URLs roll out
    // over 2 days). The hub URL appears once SEO_FAMILY_WAVE>=1; each
    // numbered family slot appears when wave>=its position. Default 0 =
    // all pages physically exist + carry noindex meta + omitted from
    // sitemap. Sister glw v37.065.
    ...(() => {
      const familyWave = parseInt(process.env.SEO_FAMILY_WAVE ?? "0", 10);
      if (!Number.isFinite(familyWave) || familyWave <= 0) return [];
      const entries: MetadataRoute.Sitemap = [
        {
          url: `${STORE.website}/strains/families`,
          lastModified: STATIC_LASTMOD,
          changeFrequency: "monthly" as const,
          priority: 0.75,
        },
      ];
      STRAIN_FAMILIES.slice(0, familyWave).forEach((f) => {
        entries.push({
          url: `${STORE.website}/strains/families/${f.slug}`,
          lastModified: STATIC_LASTMOD,
          changeFrequency: "monthly" as const,
          priority: 0.7,
        });
      });
      return entries;
    })(),
    {
      url: `${STORE.website}/heroes`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // Heroes cohort SEO landings (hack #7) — capture cohort-specific
    // Seattle search traffic (veteran cannabis Rainier Valley, JBLM
    // cannabis discount, SPD weed discount, etc.). Static-rendered.
    ...["veterans", "military", "first-responders", "healthcare", "teachers"].map((slug) => ({
      url: `${STORE.website}/heroes/${slug}`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${STORE.website}/community`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Ambassador Program v0.1 — Phase 2 customer surfaces. Sister of
    // greenlife-web same-push. Per PLAN_AMBASSADOR_PROGRAM.md §6 —
    // `/community/ambassador` is the discovery + submission landing;
    // `/community/feedback` is the open-channel suggestion form. Both
    // static + Doug-flag gated at env (AMBASSADOR_PROGRAM_ENABLED) —
    // sitemap entry is safe to include even when env is off.
    {
      url: `${STORE.website}/community/ambassador`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${STORE.website}/community/feedback`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    // Ambassador Program v0.1 — Phase 2.5 per-brief deep pages. Per
    // PLAN_AMBASSADOR_PROGRAM.md §3, each brief gets a shareable
    // 1-page graphic (QR-coded counter cards in-store + Featured-of-
    // the-week social hand-offs link out to these). Slugs come from
    // BRIEF_LIBRARY so adding a 6th brief auto-extends sitemap.
    // Priority 0.6 (peer with /community/feedback, below
    // /community/ambassador parent). Sister of greenlife-web same-push.
    ...BRIEF_LIBRARY.map((b) => ({
      url: `${STORE.website}/community/ambassador/briefs/${b.id}`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    // Ambassador Program v0.2 — Phase F apply form + Phase G public
    // leaderboard. Per PLAN_AMBASSADOR_V0_2_INFLUENCER_REACH_2026_05_23.md
    // §3 Phase F + Phase G. Sister of greenlife-web same-push.
    {
      url: `${STORE.website}/community/ambassador/apply`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${STORE.website}/community/ambassadors`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "daily",
      priority: 0.65,
    },
    { url: `${STORE.website}/blog`, lastModified: STATIC_LASTMOD, changeFrequency: "weekly", priority: 0.8 },
    { url: `${STORE.website}/about`, lastModified: STATIC_LASTMOD, changeFrequency: "monthly", priority: 0.6 },
    { url: `${STORE.website}/visit`, lastModified: STATIC_LASTMOD, changeFrequency: "weekly", priority: 0.85 },
    // /visit/from-seatac — traveler-side high-intent landing page for
    // SeaTac arrivals. Per SEO_CONTENT_DRAFTS_2026_05_09 Tier-1 Draft 8.
    // Static page (force-static); changeFrequency monthly because Light
    // Rail directions / drive-time copy doesn't turn over.
    {
      url: `${STORE.website}/visit/from-seatac`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    // /visit/from-bellevue + /visit/from-kirkland — east-side commuter
    // landing pages. Pages shipped v33.145 (sha 9b9f348, 2026-05-26)
    // under SEO_AUDIT_AUTONOMOUS_WINS_2026_05_26 Tech-SEO #3 cross-stack
    // parity scope — but their sitemap entries were not added at the
    // same time, so Google never had a crawl signal pointing at them.
    // Closes the discoverability gap. Static (force-static);
    // changeFrequency monthly (drive-time + hours copy doesn't turn
    // over). Priority 0.75 mirrors from-seatac.
    {
      url: `${STORE.website}/visit/from-bellevue`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${STORE.website}/visit/from-kirkland`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    // v27.005 — priority demoted 0.6 → 0.5 to match the spec'd "static
    // support page" tier (/faq, /accessibility, /contact, /careers, /press).
    { url: `${STORE.website}/contact`, lastModified: STATIC_LASTMOD, changeFrequency: "yearly", priority: 0.5 },
    {
      url: `${STORE.website}/press`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    // v27.005 — /faq demoted 0.7 → 0.5 (support-page tier). /learn is the
    // educational HUB → bumped 0.75 → 0.8 to peer with other hub pages.
    { url: `${STORE.website}/faq`, lastModified: STATIC_LASTMOD, changeFrequency: "yearly", priority: 0.5 },
    { url: `${STORE.website}/learn`, lastModified: STATIC_LASTMOD, changeFrequency: "weekly", priority: 0.8 },
    // /learn/terpenes — evergreen terpene primer (Phase 2 Ship 2.5). High-
    // intent SEO surface for "what strains are high in limonene seattle"-
    // class queries. Priority 0.7 — peer with the /learn/<slug> hub tier.
    {
      url: `${STORE.website}/learn/terpenes`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${STORE.website}/accessibility`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${STORE.website}/careers`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${STORE.website}/terms-of-use`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${STORE.website}/health-data-policy`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${STORE.website}/vendor-access`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${STORE.website}/apply`,
      lastModified: STATIC_LASTMOD,
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
  // Static, neighborhood-data driven from `lib/near-towns.ts`. Detail-page
  // tier per v27.005 sitemap tier alignment (priority 0.7, parent hub
  // /near at 0.8).
  const nearTownPages: MetadataRoute.Sitemap = NEAR_TOWNS.map((t) => ({
    url: `${STORE.website}/near/${t.slug}`,
    lastModified: STATIC_LASTMOD,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // /near index page — hub for all /near/<area> pages, ItemList
  // JSON-LD eligible. v27.005 — priority 0.8 (hub tier).
  const nearIndexPage: MetadataRoute.Sitemap = [
    {
      url: `${STORE.website}/near`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ];

  // /learn/<slug> hub topic landing pages. Long-form educational SEO
  // surface (~400-600 words each), data-driven from `lib/learn-hub.ts`.
  // priority 0.7 — high-intent informational lane (cannabis tax, dosing,
  // first-visit) but sits below the canonical / + /menu + /near.
  const learnHubPages: MetadataRoute.Sitemap = LEARN_HUB_TOPICS.map((t) => ({
    url: `${STORE.website}/learn/${t.slug}`,
    lastModified: STATIC_LASTMOD,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...dealPages, ...brandPages, ...postPages, ...nearIndexPage, ...nearTownPages, ...learnHubPages];
}