import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { VendorAdSlot } from "@/components/VendorAdSlot";
import { getBrandBySlug, getBrandProducts, getActiveBrands } from "@/lib/db";
import { STORE } from "@/lib/store";
import NWCSBrandPage from "./_brands/northwest-cannabis-solutions";
// GrowOpFarmsBrandPage / OoweeBrandPage / FiftyFoldBrandPage imports
// dropped 2026-05-10 — none of these brands have a vendor row in scc's
// DB (verified via sitemap audit). Pre-fix BRAND_OVERRIDES referenced
// them as canonical slugs, but every getBrandBySlug call returned null;
// pages soft-404'd. Component files kept on disk in case scc starts
// carrying. Caught by /loop tick 14 dead-config sweep (sister of T13).
import FairwindsBrandPage from "./_brands/fairwinds-manufacturing";
import MfusedBrandPage from "./_brands/mfused";
import SparkIndustriesBrandPage from "./_brands/spark-industries";
import BondiFarmsBrandPage from "./_brands/bondi-farms";
import Brand2727Page from "./_brands/2727";
import SungrownBrandPage from "./_brands/sungrown";
import RedbirdBrandPage from "./_brands/redbird-cannabis";
import DeweyCannabisCoBrandPage from "./_brands/dewey-cannabis-co";
import SeattleBubbleWorksBrandPage from "./_brands/seattle-bubble-works";
import AgroCoutureBrandPage from "./_brands/agro-couture";
import GreenRevolutionBrandPage from "./_brands/green-revolution";
import MinglewoodBrandPage from "./_brands/minglewood-brands";
// AvitasBrandPage import dropped 2026-05-10 — scc doesn't actually
// carry Avitas (no DB row whose name slugifies to any avitas variant).
// Pre-fix the override + alias map referenced "avitas" as a canonical
// slug, but every getBrandBySlug call returned null; `/brands/avitas`
// (and the `-cannabis` / `-grown` aliases) all soft-404'd. Component
// file `_brands/avitas.tsx` kept on disk in case scc starts carrying.
// Caught by /loop tick 13 dead-config audit.
import BotanicaSeattleBrandPage from "./_brands/botanica-seattle";
import { safeJsonLd } from "@/lib/json-ld-safe";

// ISR: brand detail pages are pre-rendered for known slugs (via
// `generateStaticParams` below) and refreshed every 5 min. Was force-dynamic
// — every visit ran getBrandBySlug + getBrandProducts against Neon, even for
// the same brand viewed twice in 30 seconds. Inventory rotates on the order
// of hours, not seconds, so 300s is well within freshness budget.
export const revalidate = 300;

// Per-brand custom page overrides. Add a new entry when a brand graduates
// from the generic template to a boutique layout. The component receives
// `{ brand, products }` and renders below the JSON-LD scripts so SEO stays
// consistent across templated and custom pages.
type BrandComponentProps = {
  brand: NonNullable<Awaited<ReturnType<typeof getBrandBySlug>>>;
  products: Awaited<ReturnType<typeof getBrandProducts>>;
};
const BRAND_OVERRIDES: Record<string, React.ComponentType<BrandComponentProps>> = {
  "northwest-cannabis-solutions": NWCSBrandPage,
  // grow-op-farms removed — scc doesn't carry (no DB row). T14 dead-cfg.
  "fairwinds-manufacturing": FairwindsBrandPage,
  "mfused": MfusedBrandPage,
  "spark-industries": SparkIndustriesBrandPage,
  "bondi-farms": BondiFarmsBrandPage,
  // oowee removed — scc doesn't carry (no DB row). T14 dead-cfg.
  // scc 2727 vendor row is "Northwest Distributing LLC dba 2727" — DB
  // slug `northwest-distributing-llc-dba-2727`. BRAND_OVERRIDES key was
  // bare `2727` (matches glw's vendor name shape, not scc's WSLCB
  // filing) so the override never ran on scc — `/brands/2727` 404'd
  // and the URL Google indexed (`/brands/northwest-distributing-llc-dba-2727`)
  // fell through to the generic template. T14 fix.
  "northwest-distributing-llc-dba-2727": Brand2727Page,
  "edgemont-group-dba-sungrown": SungrownBrandPage,
  "redbird-cannabis": RedbirdBrandPage,
  // scc Dewey vendor row is "Dewey Botanicals LLC" (DB slug
  // "dewey-botanicals-llc"), NOT the same vendor as glw's "Dewey
  // Cannabis Co." — same brand family, different WSLCB filings per
  // store. BRAND_OVERRIDES key MUST match the actual scc DB slug;
  // pre-fix it was "dewey-cannabis-co" (glw's slug) so the override
  // never ran on scc — `/brands/dewey-botanicals-llc` (the URL Google
  // indexed from scc's sitemap) fell through to the generic template
  // instead of the rich boutique component. Fixed 2026-05-10.
  "dewey-botanicals-llc": DeweyCannabisCoBrandPage,
  "seattle-bubble-works": SeattleBubbleWorksBrandPage,
  "agro-couture": AgroCoutureBrandPage,
  "green-revolution": GreenRevolutionBrandPage,
  // fifty-fold removed — scc doesn't carry (no DB row). T14 dead-cfg.
  "minglewood-brands": MinglewoodBrandPage,
  // `avitas` removed 2026-05-10 — scc doesn't carry Avitas (see
  // import-comment above for context).
  "botanica-seattle": BotanicaSeattleBrandPage,
};

// Slug aliases — friendly customer-facing URLs that map to the actual
// vendor row's auto-generated slug. Sub-brands of multi-brand producers
// get their own URL even though the products live under the parent
// vendor (e.g. Plaid Jacket is a Spark Industries sub-brand).
const SLUG_ALIASES: Record<string, string> = {
  "plaid-jacket": "spark-industries",
  // phat-panda alias dropped 2026-05-10 (T14) — scc doesn't carry
  // Grow-Op Farms (Phat Panda's parent) at all, so the alias pointed
  // at a non-existent canonical and 404'd.
  "sungrown": "edgemont-group-dba-sungrown",
  // Customer-friendly URL `/brands/2727` aliases to the actual scc
  // DB slug. T14 fix.
  "2727": "northwest-distributing-llc-dba-2727",
  "leafwerx": "edgemont-group-dba-sungrown",
  // scc's actual Dewey DB slug is "dewey-botanicals-llc" — map the
  // shorter customer-facing variants to that canonical.
  "dewey-cannabis-co": "dewey-botanicals-llc",
  "dewey-botanicals": "dewey-botanicals-llc",
  "slab-mechanix": "agro-couture",
  // Avitas SLUG_ALIASES removed 2026-05-10 — scc doesn't carry Avitas
  // (see BRAND_OVERRIDES + import comments above for context).
  // Botanica Seattle has multiple sub-brands a customer might search for
  // by name even though all the products live under the parent vendor row.
  "mr-moxeys": "botanica-seattle",
  "mr-moxey-s": "botanica-seattle",
  "moxey": "botanica-seattle",
  "journeyman": "botanica-seattle",
  "spot": "botanica-seattle",
  "botanica": "botanica-seattle",
};

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const brands = await getActiveBrands().catch(() => []);
  return brands.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  // Alias-resolution sister of the page render (line ~138). Pre-fix,
  // generateMetadata called getBrandBySlug with the RAW slug while the
  // page component called it with the alias-RESOLVED slug — so for
  // every SLUG_ALIAS entry (`/brands/botanica`, `/brands/mr-moxeys`,
  // `/brands/spot`, `/brands/journeyman`, `/brands/plaid-jacket`,
  // `/brands/phat-panda`, `/brands/sungrown`, `/brands/leafwerx`,
  // `/brands/dewey-botanicals`, `/brands/dewey-botanicals-llc`,
  // `/brands/slab-mechanix`, `/brands/avitas-cannabis`,
  // `/brands/avitas-grown`, `/brands/rays-lemonade`, etc.) the page
  // would render correctly but the metadata would be the layout's
  // default title + noindex hint. That meant Google indexed the alias
  // URLs as duplicates of the homepage title — exactly the kind of
  // duplicate-content signal that hurts the canonical brand page's
  // ranking. Caught 2026-05-10 by /loop tick 4 cross-stack title-
  // uniqueness audit on scc sitemap (151 URLs).
  const slug = SLUG_ALIASES[rawSlug] ?? rawSlug;
  const brand = await getBrandBySlug(slug).catch(() => null);
  if (!brand) {
    // Soft-404 mitigation — sister glw fix. ISR + page-level notFound()
    // produces HTTP 200 with not-found.tsx body for unknown slugs; the
    // `robots: noindex` hint prevents Google from indexing the soft-404.
    return { robots: { index: false, follow: false } };
  }
  return {
    title: brand.name,
    description: `Shop ${brand.name} cannabis products at ${STORE.name} in Rainier Valley, Seattle WA. ${brand.activeSkus} products in stock.`,
    // Canonical points at the resolved (canonical) slug, NOT the alias —
    // so /brands/botanica's `<link rel=canonical>` reads
    // `/brands/botanica-seattle`. That's the correct dedupe signal for
    // Google: alias URLs are alternates pointing at the canonical.
    alternates: { canonical: `/brands/${slug}` },
    openGraph: {
      siteName: STORE.name,
      type: "website",
      locale: "en_US",
      title: `${brand.name} | ${STORE.name}`,
      description: `Browse ${brand.name} products available at Seattle Cannabis Co., Rainier Valley WA.`,
      ...(brand.logoUrl ? { images: [{ url: brand.logoUrl }] } : {}),
    },
  };
}

const STRAIN_COLORS: Record<string, { badge: string }> = {
  sativa: { badge: "bg-red-100 text-red-700 border-red-200" },
  indica: { badge: "bg-purple-100 text-purple-700 border-purple-200" },
  hybrid: { badge: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

const CAT_ICONS: Record<string, string> = {
  Flower: "🌿",
  "Pre-Rolls": "🫙",
  Vapes: "💨",
  Concentrates: "🧴",
  Edibles: "🍬",
  Tinctures: "💊",
  Topicals: "🧼",
  Accessories: "🔧",
};

export default async function BrandPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = SLUG_ALIASES[rawSlug] ?? rawSlug;
  const brand = await getBrandBySlug(slug).catch(() => null);
  if (!brand) notFound();

  const products = await getBrandProducts(brand.id).catch(() => []);
  const categories = [...new Set(products.map((p) => p.category ?? "Other"))].sort((a, b) => {
    const order = [
      "Flower",
      "Pre-Rolls",
      "Vapes",
      "Concentrates",
      "Edibles",
      "Tinctures",
      "Topicals",
      "Accessories",
      "Other",
    ];
    return order.indexOf(a) - order.indexOf(b);
  });

  const brandUrl = `${STORE.website}/brands/${slug}`;
  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "@id": `${brandUrl}#brand`,
    name: brand.name,
    ...(brand.website ? { url: brand.website } : {}),
    ...(brand.logoUrl ? { logo: brand.logoUrl } : {}),
  };

  // Product schemas — gives AI engines structured, citable answers for
  // "{brand} cannabis Seattle" and "{product name} price near me" queries.
  const productSchemas = products
    .filter((p) => p.unit_price != null)
    .map((p) => ({
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${brandUrl}#product-${p.id}`,
      name: p.name,
      brand: { "@type": "Brand", name: brand.name },
      ...(p.category ? { category: p.category } : {}),
      ...(p.image_url ? { image: p.image_url } : {}),
      ...(p.effects ? { description: p.effects } : {}),
      ...(p.thc_pct != null
        ? {
            additionalProperty: [
              { "@type": "PropertyValue", name: "THC", value: `${p.thc_pct.toFixed(1)}%` },
              ...(p.cbd_pct != null && p.cbd_pct > 0
                ? [{ "@type": "PropertyValue", name: "CBD", value: `${p.cbd_pct.toFixed(1)}%` }]
                : []),
              ...(p.strain_type
                ? [{ "@type": "PropertyValue", name: "Strain Type", value: p.strain_type }]
                : []),
            ],
          }
        : {}),
      offers: {
        "@type": "Offer",
        price: p.unit_price!.toFixed(2),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        availableAtOrFrom: { "@type": "Place", name: STORE.name, address: STORE.address.full },
        seller: { "@id": `${STORE.website}/#dispensary` },
        url: STORE.shopUrl,
      },
    }));

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${brandUrl}#page`,
    name: `${brand.name} at ${STORE.name}`,
    description: `${brand.activeSkus} ${brand.name} cannabis product${brand.activeSkus !== 1 ? "s" : ""} in stock at ${STORE.name}, ${STORE.neighborhood}, Seattle WA.`,
    url: brandUrl,
    about: { "@id": `${brandUrl}#brand` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: { "@id": `${brandUrl}#product-${p.id}`, name: p.name },
      })),
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
        { "@type": "ListItem", position: 2, name: brand.name, item: brandUrl },
      ],
    },
  };

  const Override = BRAND_OVERRIDES[slug];
  if (Override) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(brandSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionSchema) }}
        />
        {productSchemas.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: safeJsonLd(productSchemas) }}
          />
        )}
        <Override brand={brand} products={products} />
      </>
    );
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(brandSchema) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionSchema) }}
      />
      {productSchemas.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(productSchemas) }}
        />
      )}

      {/* Hero — gradient bookend matching the rest of the site. */}
      <div className="bg-gradient-to-br from-indigo-950 via-violet-950 to-indigo-950 text-white py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4 sm:gap-6">
          {brand.logoUrl ? (
            <div className="shrink-0 w-20 h-20 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-lg relative overflow-hidden">
              <Image src={brand.logoUrl} alt={brand.name} fill className="object-contain p-2" unoptimized />
            </div>
          ) : (
            <div className="shrink-0 w-20 h-20 rounded-2xl bg-indigo-800 border border-indigo-700 flex items-center justify-center text-2xl">
              🌿
            </div>
          )}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{brand.name}</h1>
            <p className="text-indigo-300/70 text-sm mt-1 flex flex-wrap items-center gap-3">
              <span>
                {brand.activeSkus} product{brand.activeSkus !== 1 ? "s" : ""} in Seattle, WA
              </span>
              {brand.website && (
                <a
                  href={brand.website.startsWith("http") ? brand.website : `https://${brand.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors underline underline-offset-2 text-indigo-400"
                >
                  Visit website ↗
                </a>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10 sm:space-y-12">
        {/* Vendor / house ad — top of brand page (placement_slot='brand_page_top') */}
        <VendorAdSlot slot="brand_page_top" />

        {/* Brand bio + socials — vendor-authored via /vmi/profile. Both
            blocks render only when the vendor has filled them in (avoids a
            half-empty section on brands that haven't logged in yet). The
            handle is sanitized to [A-Za-z0-9._-] before being concatenated
            into a URL — without this, a vendor could put `realbrand?phish=1`
            in their handle to add unwanted query params, or worse use `..` to
            climb the path. The /vmi Server Action only strips a leading `@`. */}
        {(() => {
          const safe = (h: string | null) => (h ? (h.match(/^[A-Za-z0-9._-]+$/) ? h : null) : null);
          const ig = safe(brand.socialInstagram);
          const x = safe(brand.socialX);
          const fb = safe(brand.socialFacebook);
          if (!brand.brandBio && !ig && !x && !fb) return null;
          return (
            <section className="rounded-2xl border border-stone-100 bg-white p-6 sm:p-8 space-y-5">
              {brand.brandBio && (
                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-700">
                    About {brand.name}
                  </p>
                  {brand.brandBio.split(/\n{2,}/).map((para, i) => (
                    <p key={i} className="text-stone-700 leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              )}
              {(ig || x || fb) && (
                <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-stone-100">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Follow them
                  </p>
                  {ig && (
                    <a
                      href={`https://instagram.com/${ig}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-700 hover:text-indigo-600 font-semibold underline underline-offset-2"
                    >
                      @{ig} on Instagram
                    </a>
                  )}
                  {x && (
                    <a
                      href={`https://x.com/${x}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-700 hover:text-indigo-600 font-semibold underline underline-offset-2"
                    >
                      @{x} on X
                    </a>
                  )}
                  {fb && (
                    <a
                      href={`https://facebook.com/${fb}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-700 hover:text-indigo-600 font-semibold underline underline-offset-2"
                    >
                      {fb} on Facebook
                    </a>
                  )}
                </div>
              )}
            </section>
          );
        })()}

        <div className="rounded-2xl bg-gradient-to-r from-indigo-800 to-indigo-700 text-white px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-base">Want to order {brand.name}?</p>
            <p className="text-indigo-200/80 text-sm">Place a pickup order — save 20% online.</p>
          </div>
          <a
            href={STORE.shopUrl}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold transition-all shadow-md hover:-translate-y-0.5"
          >
            Order Online — 20% Off →
          </a>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="text-4xl" aria-hidden="true">🌿</div>
            <p className="text-stone-500 font-medium">No products currently in stock</p>
            <a href={STORE.shopUrl} className="text-sm text-indigo-700 font-semibold hover:underline">
              Browse full menu →
            </a>
          </div>
        ) : (
          categories.map((cat) => {
            const catProducts = products.filter((p) => (p.category ?? "Other") === cat);
            return (
              <section key={cat}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl" aria-hidden="true">{CAT_ICONS[cat] ?? "🌱"}</span>
                  <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">{cat}</h2>
                  <span className="text-xs font-medium text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                    {catProducts.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catProducts.map((p) => {
                    const strainKey = (p.strain_type ?? "").toLowerCase();
                    const strain = STRAIN_COLORS[strainKey];
                    return (
                      <div
                        key={p.id}
                        className="rounded-2xl border border-stone-100 bg-white overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all group"
                      >
                        {p.image_url ? (
                          <div className="h-44 bg-stone-100 overflow-hidden relative">
                            <Image
                              src={p.image_url}
                              alt={p.name}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="h-32 bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center text-4xl">
                            {CAT_ICONS[cat] ?? "🌱"}
                          </div>
                        )}
                        <div className="p-4 space-y-3">
                          <h3 className="font-bold text-stone-900 text-sm leading-snug">{p.name}</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {p.strain_type && strain && (
                              <span
                                className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold capitalize ${strain.badge}`}
                              >
                                {p.strain_type}
                              </span>
                            )}
                            {p.thc_pct != null && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                                THC {p.thc_pct.toFixed(1)}%
                              </span>
                            )}
                            {p.cbd_pct != null && p.cbd_pct > 0 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                                CBD {p.cbd_pct.toFixed(1)}%
                              </span>
                            )}
                          </div>
                          {p.effects && <p className="text-xs text-stone-400 line-clamp-1">✨ {p.effects}</p>}
                          <div className="flex items-center justify-between pt-1 border-t border-stone-50">
                            {p.unit_price != null ? (
                              <span className="font-extrabold text-stone-900">
                                ${p.unit_price.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-stone-300">—</span>
                            )}
                            <a
                              href={STORE.shopUrl}
                              className="text-xs font-bold text-indigo-700 hover:text-indigo-600 transition-colors"
                            >
                              Order →
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}

      </div>
    </>
  );
}
