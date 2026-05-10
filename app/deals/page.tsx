import type { Metadata } from "next";
import Link from "next/link";
import { STORE, DEFAULT_OG_IMAGE} from "@/lib/store";
import { getActiveDeals } from "@/lib/db";
import { DealArt } from "@/components/DealArt";
import { matchDealVendor } from "@/lib/deal-vendor-match";
import { withAttr } from "@/lib/attribution";
import { VendorAdSlot } from "@/components/VendorAdSlot";
import { safeJsonLd } from "@/lib/json-ld-safe";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  // Root layout's title.template wraps this with " | <STORE.name>", so don't
  // include the brand here — was rendering "... | Seattle Cannabis Co. | Seattle Cannabis Co.".
  title: "Cannabis Deals & Specials",
  // ~150 chars — v11.005 length sweep.
  description: `Live cannabis deals at ${STORE.name} in ${STORE.address.city}, WA. Daily specials on flower, edibles, vapes, concentrates. WSLCB-compliant.`,
  alternates: { canonical: "/deals" },
  openGraph: {
    siteName: STORE.name,
    locale: "en_US",
    title: `Cannabis Deals | ${STORE.name}`,
    description: `Live deals at ${STORE.name}. ${STORE.address.full}.`,
    url: `${STORE.website}/deals`,
    type: "website",
    // Explicit reference to the root opengraph-image.tsx route — without it,
    // page-level openGraph fully replaces the parent's auto-injected images
    // and Facebook/Slack/Messages share previews come up imageless.
    images: [DEFAULT_OG_IMAGE],
  },
};

function fmtEndDate(iso: string | null): string {
  if (!iso) return "Ongoing";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

type Props = { searchParams: Promise<{ cat?: string }> };

const FILTER_CATS = ["flower", "pre-rolls", "vapes", "concentrates", "edibles", "beverages"] as const;
type FilterCat = (typeof FILTER_CATS)[number];

function normalizeCat(cat: string | null): FilterCat | "all" {
  const v = (cat ?? "").toLowerCase();
  if (FILTER_CATS.includes(v as FilterCat)) return v as FilterCat;
  return "all";
}

export default async function DealsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const activeFilter = normalizeCat(sp.cat ?? null);
  // PWA-install detection — cookie set by /api/track-install on first
  // standalone-mode launch. Customers who installed the SCC PWA see
  // app_only deals; browser-only visitors don't (they see the install
  // banner instead, which is the conversion path). Doug 2026-05-07.
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const isInstalled = cookieStore.get("scc_pwa_installed")?.value === "1";
  const allDeals = await getActiveDeals({ includeAppOnly: isInstalled }).catch(() => []);
  const deals =
    activeFilter === "all"
      ? allDeals
      : allDeals.filter((d) => normalizeCat(d.appliesTo) === activeFilter);

  const catCounts: Record<FilterCat | "all", number> = {
    all: allDeals.length,
    flower: 0,
    "pre-rolls": 0,
    vapes: 0,
    concentrates: 0,
    edibles: 0,
    beverages: 0,
  };
  for (const d of allDeals) {
    const c = normalizeCat(d.appliesTo);
    if (c !== "all") catCounts[c] += 1;
  }

  // SEO: Each deal becomes a SpecialAnnouncement so AI engines and Google's
  // local-pack carry the promo text verbatim. Limited-time deals win here.
  const dealsSchema =
    deals.length > 0
      ? deals.map((d) => ({
          "@context": "https://schema.org",
          "@type": "SpecialAnnouncement",
          "@id": `${STORE.website}/deals#${d.id}`,
          name: d.name,
          text: d.description ?? d.short,
          category: "https://www.wikidata.org/wiki/Q1622659", // discount/sale
          spatialCoverage: { "@id": `${STORE.website}/#dispensary` },
          ...(d.endDate
            ? { datePosted: new Date().toISOString(), expires: `${d.endDate}T23:59:59-08:00` }
            : {}),
        }))
      : [];

  // BreadcrumbList — earns SERP path rendering (Home › Deals).
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${STORE.website}/deals#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Deals", item: `${STORE.website}/deals` },
    ],
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {dealsSchema.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(dealsSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
        <VendorAdSlot slot="deals_page_top" />
      </div>

      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-900 text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1.5px, transparent 1.5px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">🔥 Live Deals</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight">
            What&apos;s on sale right now.
          </h1>
          <p className="mt-3 text-indigo-100/80 max-w-md mx-auto">
            Updated continuously from our live menu. WSLCB-compliant — percent-off and dollar-off only, never
            below cost.
          </p>
        </div>
      </section>

      {/* ─── Category filter chips ────────────────────────────────────────── */}
      {allDeals.length > 1 && (
        <section className="border-b border-stone-200 bg-white sticky top-0 z-20 backdrop-blur-md bg-white/90">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
            {(["all", ...FILTER_CATS] as const).map((cat) => {
              const count = catCounts[cat];
              const isActive = activeFilter === cat;
              const isEmpty = count === 0;
              const href = cat === "all" ? "/deals" : `/deals?cat=${cat}`;
              return (
                <Link
                  key={cat}
                  href={href}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                    isActive
                      ? "bg-indigo-700 text-white shadow-sm"
                      : isEmpty
                        ? "bg-stone-100 text-stone-400 cursor-default pointer-events-none"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {cat === "all" ? "All deals" : cat}
                  <span
                    className={`text-[10px] tabular-nums px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-indigo-900/40 text-indigo-100"
                        : isEmpty
                          ? "bg-stone-200 text-stone-400"
                          : "bg-stone-200 text-stone-600"
                    }`}
                  >
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {deals.length === 0 ? (
        <section className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
          {/* Empty state — calm, not apologetic. Filter-aware: when a
              category filter zeros out, point back to all deals before the
              loyalty-everyday-value fallback. */}
          <div className="rounded-3xl border border-stone-200 bg-white p-8 sm:p-10 text-center shadow-sm">
            <div className="text-4xl mb-4" aria-hidden>
              🌿
            </div>
            {activeFilter !== "all" && allDeals.length > 0 ? (
              <>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                  No <span className="capitalize">{activeFilter}</span> deals right now.
                </h2>
                <p className="text-stone-600 mt-3 max-w-md mx-auto leading-relaxed">
                  We have {allDeals.length} other deal{allDeals.length === 1 ? "" : "s"} running
                  — pop the filter off to see them.
                </p>
                <Link
                  href="/deals"
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-700 hover:bg-indigo-600 text-white font-bold transition-colors shadow-sm"
                >
                  See all deals →
                </Link>
                <p className="text-xs text-stone-500 mt-5">
                  Cash only · 21+ with valid ID · {STORE.address.full}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                  No deals today — but you still earn points.
                </h2>
                <p className="text-stone-600 mt-3 max-w-md mx-auto leading-relaxed">
                  100 points = $1 off at the counter on a regular-price visit. Browse
                  the live menu — we&apos;ll have what you&apos;re after.
                </p>
                <Link
                  href="/menu"
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-700 hover:bg-indigo-600 text-white font-bold transition-colors shadow-sm"
                >
                  Browse the menu →
                </Link>
                <p className="text-xs text-stone-500 mt-5">
                  Cash only · 21+ with valid ID · {STORE.address.full}
                </p>
              </>
            )}
          </div>
        </section>
      ) : (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-5">
          {deals.map((d, i) => {
            const vendor = matchDealVendor(d.name, d.description);
            const isFirst = i === 0;
            return (
              <article
                key={d.id}
                className={`group rounded-2xl border bg-white overflow-hidden transition-all hover:shadow-xl hover:-translate-y-0.5 ${
                  isFirst
                    ? "border-indigo-300 shadow-md ring-1 ring-indigo-100"
                    : "border-stone-200 hover:border-indigo-300"
                }`}
              >
                {/* Wide bud-art hero strip — vendor photo + logo card when
                    we recognize the brand, category-themed gradient when
                    we don't. Mirrors the dialed-in /brands/[slug] pages. */}
                <DealArt
                  vendor={vendor}
                  appliesTo={d.appliesTo}
                  short={d.short}
                  paletteAccent="indigo"
                />

                <div className="p-5 sm:p-6">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight leading-tight">
                      <Link
                        href={`/deals/${d.id}`}
                        className="hover:text-indigo-800 transition-colors"
                      >
                        {d.name}
                      </Link>
                    </h2>
                    {isFirst && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-600 text-white uppercase tracking-wide">
                        Ending Soonest
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-stone-600 text-sm leading-relaxed">
                    {d.description ?? d.short}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="text-stone-500">
                      Ends:{" "}
                      <span className="font-semibold text-stone-700">{fmtEndDate(d.endDate)}</span>
                    </span>
                    {d.appliesTo && d.appliesTo !== "all" && (
                      <span className="text-stone-500 capitalize">
                        On:{" "}
                        <span className="font-semibold text-stone-700">{d.appliesTo}</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                    {vendor && (
                      <Link
                        href={withAttr(`/brands/${vendor.slug}`, "deals-card", `${d.id}-vendor`)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold bg-stone-900 text-white hover:bg-stone-700 transition-colors"
                      >
                        Shop {vendor.displayName} →
                      </Link>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Link
                      href={withAttr("/menu", "deals-card", d.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-sm transition-colors shadow-sm"
                    >
                      View on menu →
                    </Link>
                    <Link
                      href={`/deals/${d.id}`}
                      className="text-sm font-semibold text-indigo-800 hover:text-indigo-600 transition-colors"
                    >
                      Deal details →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}

          <div className="pt-6 text-center">
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-bold transition-colors shadow-sm"
            >
              Order for pickup →
            </Link>
            <p className="text-xs text-stone-500 mt-3">
              Cash only · 21+ with valid ID · {STORE.name}, {STORE.address.full}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
