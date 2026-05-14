import type { Metadata } from "next";
import Link from "next/link";
import { STORE, DEFAULT_OG_IMAGE } from "@/lib/store";
import { STRAIN_TYPES } from "@/lib/strain-types";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { withAttr } from "@/lib/attribution";
import { Breadcrumb } from "@/components/Breadcrumb";

// /strains — strain-category hub page. Captures long-tail intent like
// "indica strains Seattle", "sativa Rainier Valley", "cbd strains
// south Seattle". Sister surface to /find-your-strain (which is the
// 3-question quiz) — this page is a SERP-targeted directory of the
// four shelf categories with descriptive, non-promissory copy per
// WAC 314-55-155.
//
// Voice: tenure framing ("Since 2010, pre-I-502") + Rainier Valley
// signal; /menu CTA only. No effect/medical claims.

export const dynamic = "force-static";
export const revalidate = false;

const TITLE = `Strains — ${STORE.name}`;
const DESCRIPTION = `Indica, sativa, hybrid, and CBD-dominant strain categories at ${STORE.name} in Rainier Valley, Seattle. Live menu, Rainier Ave S since 2010.`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/strains" },
  keywords: [
    "cannabis strains Seattle",
    "indica strains Seattle",
    "sativa strains Seattle",
    "hybrid strains Seattle",
    "CBD strains Seattle",
    "dispensary strains Rainier Valley",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: TITLE,
    description: DESCRIPTION,
    url: `${STORE.website}/strains`,
    siteName: STORE.name,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function StrainsIndexPage() {
  // CollectionPage + ItemList — Google reads the four type pages as
  // children of this hub, mirroring how /near uses ItemList on its
  // index. Sister surface; same JSON-LD shape.
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${STORE.website}/strains#collection`,
    name: TITLE,
    description: DESCRIPTION,
    isPartOf: { "@id": `${STORE.website}/#dispensary` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: STRAIN_TYPES.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${t.name} strains`,
        url: `${STORE.website}/strains/${t.slug}`,
      })),
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${STORE.website}/strains#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Strains", item: `${STORE.website}/strains` },
    ],
  };

  return (
    <main className="bg-stone-50 text-stone-900 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />

      <Breadcrumb items={[{ label: "Strains" }]} />

      {/* Hero — indigo/violet matches /near + /visit identity. */}
      <section className="relative bg-gradient-to-br from-indigo-950 via-violet-950 to-indigo-950 text-white overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 80% 50%, #818cf833, transparent), radial-gradient(ellipse 50% 60% at 20% 100%, #c026d322, transparent)",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-10 sm:pb-14">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-indigo-300 mb-3">
            Strain categories · Rainier Valley
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] mb-4 max-w-3xl">
            Strains at {STORE.name}
            <span className="block text-indigo-300/90 font-semibold text-xl sm:text-2xl md:text-3xl mt-2">
              Indica, sativa, hybrid, CBD-dominant — on Rainier Ave S since 2010
            </span>
          </h1>
          <p className="text-base sm:text-lg text-indigo-100/90 leading-relaxed max-w-2xl mb-7">
            We carry the four shelf categories you’d expect from a Washington dispensary, stocked from regional craft growers and rotated as harvests come in. Pre-I-502 origin as a Rainier Valley medical collective; same Rainier Ave S address.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href={withAttr("/menu", "quiz", "browse-all")}
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-2xl bg-indigo-300 hover:bg-indigo-200 text-indigo-950 font-bold text-sm transition-all shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950"
            >
              Browse the live menu
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/find-your-strain"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              Take the 3-question quiz
            </Link>
          </div>
        </div>
      </section>

      {/* Type cards — four big cards, one per strain category. */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-700 mb-2">
            Pick a category
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Four shelf categories on the menu
          </h2>
          <p className="mt-3 text-stone-600 max-w-2xl text-sm sm:text-base leading-relaxed">
            These labels signal lineage and breeding heritage rather than guaranteed outcome — most modern strains are hybrids in some sense. Click through for a descriptive overview of each category and what to look for on the shelf.
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {STRAIN_TYPES.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/strains/${t.slug}`}
                className="group block rounded-2xl bg-white border border-stone-200 hover:border-indigo-400 hover:shadow-md transition-all p-5 sm:p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-700 mb-2">
                  {t.eyebrow}
                </p>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 group-hover:text-indigo-800 transition-colors mb-2">
                  {t.name} strains
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed mb-3">
                  {t.subhead}.
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 group-hover:text-indigo-900">
                  Read about {t.name.toLowerCase()}
                  <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Compliance + tenure footer band — matches /near pattern. */}
      <section className="bg-gradient-to-br from-indigo-950 via-violet-950 to-indigo-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="max-w-md">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-300 mb-2">
                Live menu
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 leading-tight">
                The shelf updates as harvests come in.
              </h2>
              <p className="text-indigo-200/80 text-sm sm:text-base leading-relaxed">
                Browse the live menu to see what’s in the building right now across all four categories. Cash only at the counter, 21+.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href={withAttr("/menu", "quiz", "footer-menu")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-300 hover:bg-indigo-200 text-indigo-950 font-bold text-sm transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950"
              >
                Browse menu
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/visit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
              >
                Hours + directions
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10 text-center">
        <p className="text-xs text-stone-400">
          Not medical advice. 21+. {STORE.name}, {STORE.address.city}, WA.
        </p>
      </section>
    </main>
  );
}
