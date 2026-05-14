import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STORE } from "@/lib/store";
import { NEAR_TOWNS, getTown } from "@/lib/near-towns";
import { safeJsonLd } from "@/lib/json-ld-safe";

// /near/<area> — Seattle-neighborhood landing pages. Each maps to a
// NEAR_TOWNS entry; static + force-static, content data-driven from
// the SSoT. Sitemap auto-pulls these in.

export const dynamic = "force-static";
export const revalidate = false;
// dynamicParams=false: unknown :town slugs return proper HTTP 404 instead
// of rendering a 200-status "Not found" page. Sister glw fix.
export const dynamicParams = false;

export function generateStaticParams() {
  return NEAR_TOWNS.map((t) => ({ town: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ town: string }>;
}): Promise<Metadata> {
  const { town: slug } = await params;
  const area = getTown(slug);
  if (!area) return { title: "Not found" };

  // title.absolute drops template suffix `· Seattle Cannabis Co.` so
  // /near/* pages stay under Google ~60-char SERP cap. Sister glw same-push.
  const title = { absolute: `${area.name} Dispensary — ${STORE.name}` } as const;
  // Pre-fix template combined `area.name → STORE: N min. pitch. Open
  // daily 8 AM–11 PM, cash only, 21+.` which ran 200+ chars on the
  // longest /near/[town] entries (e.g. /near/west-seattle = 219 chars).
  // The leading "X to STORE: N min." was redundant with `pitch` (every
  // pitch already names the route + drive time). Drop it; just use
  // pitch + a shortened CTA trailer ("Open daily" — 8 AM–11 PM is
  // visible in 6+ places on the page already, no need to bake into
  // every meta description). Caught 2026-05-10 by /loop tick 6 cross-
  // stack description-length re-audit. Sister glw same-push.
  const desc = `${area.pitch} Open daily, cash only, 21+.`;

  return {
    title,
    description: desc,
    alternates: { canonical: `/near/${area.slug}` },
    keywords: [
      `${area.name} dispensary`,
      `weed near ${area.name}`,
      `cannabis near ${area.name}`,
      `${area.name} cannabis store`,
      `${area.name} pre-rolls`,
      `${area.name} edibles`,
      `dispensary near ${area.name}`,
    ],
    openGraph: {
      type: "website",
      locale: "en_US",
      title,
      description: desc,
      url: `${STORE.website}/near/${area.slug}`,
      siteName: STORE.name,
      // Explicit per-route OG URL (scc v26.805). Co-located
      // `opengraph-image.tsx` is the per-area card; this entry points
      // at the per-route file. See `check-per-route-og-image.mjs` fix
      // shape B + `check-og-completeness.mjs` images-required rule.
      images: [
        {
          url: `/near/${area.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${area.name} → ${STORE.name} · ${area.driveMins} min`,
        },
      ],
    },
  };
}

export default async function NearTownPage({
  params,
}: {
  params: Promise<{ town: string }>;
}) {
  const { town: slug } = await params;
  const area = getTown(slug);
  if (!area) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    // @id references the canonical `#dispensary` from app/layout.tsx so
    // Google merges the area-served declaration with the home-page
    // LocalBusiness instead of treating /near/<area> as a separate
    // store. Sister glw v7.625.
    "@id": `${STORE.website}/#dispensary`,
    mainEntityOfPage: { "@id": `${STORE.website}/near/${area.slug}` },
    name: STORE.name,
    description: `Cannabis dispensary serving ${area.name}, Seattle.`,
    address: {
      "@type": "PostalAddress",
      streetAddress: STORE.address.street,
      addressLocality: STORE.address.city,
      addressRegion: STORE.address.state,
      postalCode: STORE.address.zip,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: STORE.geo.lat,
      longitude: STORE.geo.lng,
    },
    telephone: STORE.phoneTel,
    url: STORE.website,
    areaServed: {
      "@type": "Place",
      name: `${area.name}, Seattle, WA`,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Seattle",
        addressRegion: STORE.address.state,
        addressCountry: "US",
      },
    },
    // SpeakableSpecification — explicit anchor for voice assistants
    // (Google Assistant / Siri / Alexa) so a "near me" voice query
    // surfaces a compact readback of the load-bearing facts (H1 +
    // anything tagged `data-speakable`: cityCopy lede + address line).
    // Generic CSS selectors so future copy doesn't need to know about
    // this contract. Sister glw v34.405 + GW v2.97.M1 SpeakableSpecification port.
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "[data-speakable]"],
    },
  };

  // BreadcrumbList — Google renders the path under the SERP result
  // (Home › Visit › <neighborhood>) instead of just the URL string,
  // which earns 1-2% CTR per Search Console A/Bs. Mirrors the visible
  // breadcrumb nav rendered below.
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    // T92 sister of glw same-fix.
    "@id": `${STORE.website}/near/${area.slug}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Visit", item: `${STORE.website}/visit` },
      { "@type": "ListItem", position: 3, name: area.name, item: `${STORE.website}/near/${area.slug}` },
    ],
  };

  // FAQPage — per-neighborhood Q&A block so Google + LLMs (ChatGPT,
  // Perplexity, Claude.ai, Gemini) have explicit structured Q&A to
  // cite. Five questions per page; 2 are area-specific (drive-time +
  // transit) and pull from `area.driveMins` + `area.transit`; the
  // other 3 are structural facts (address / cash-only / hours / 21+)
  // and pull from STORE constants. Hardcoded answers but routed
  // through safeJsonLd() per existing convention. Voice: operator-grit,
  // no exclamation marks, U+2019 apostrophes, WAC 314-55-155 lane
  // (no effect/medical/promo claims).
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${STORE.website}/near/${area.slug}#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: `How long is the drive from ${area.name} to ${STORE.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `About ${area.driveMins} minutes by car. On transit: ${area.transit}.`,
        },
      },
      {
        "@type": "Question",
        name: `What${"’"}s the address?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${STORE.address.full}. Free parking out front.`,
        },
      },
      {
        "@type": "Question",
        name: "Do you take cards?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Cash only at the counter. There${"’"}s an ATM in the lobby.`,
        },
      },
      {
        "@type": "Question",
        name: "What are your hours?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "8 AM to 11 PM daily. Open every day of the year.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to be 21?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. ID checked at the door per WAC. 21 and up only.",
        },
      },
    ],
  };

  const otherAreas = NEAR_TOWNS.filter((t) => t.slug !== area.slug);

  // Static hours summary — uniform 8 AM–11 PM seven days a week on scc.
  // Page is force-static + revalidate=false; baking a "today's hours"
  // string at build time would drift by day-of-week on every
  // subsequent day. Customers needing live status click "Hours +
  // directions" → /visit which is ISR'd. Mirrors glw same shape;
  // scc's uniform schedule lets us collapse to a single string.
  const hoursSummaryStatic = "8 AM – 11 PM daily";

  return (
    <main className="bg-stone-50 text-stone-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqLd) }}
      />

      {/* ── HERO ────────────────────────────────────────────────────────
          Indigo→violet gradient hero band matching /visit + / sister
          pages — same SCC identity across every page. Eyebrow + big h1
          + sub-h1 carrying the drive-time line + pitch + 3 above-the-
          fold CTAs (Browse menu / Hours + directions / tel:phone) all
          visible at 360px width. Sister glw v33.805 (green-950 there;
          indigo/violet here).
      */}
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
            // Two radial pools — indigo on the right, fuchsia on the
            // bottom-left — matching the homepage hero's mesh.
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 80% 50%, #818cf833, transparent), radial-gradient(ellipse 50% 60% at 20% 100%, #c026d322, transparent)",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-10 sm:pb-14">
          <nav className="text-xs text-indigo-300/70 mb-6 flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span aria-hidden="true" className="text-indigo-700">·</span>
            <Link href="/visit" className="hover:text-white transition-colors">Visit</Link>
            <span aria-hidden="true" className="text-indigo-700">·</span>
            <span className="text-indigo-200">{area.name}</span>
          </nav>

          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-indigo-300 mb-3">
            Near you · Rainier Valley
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] mb-4 max-w-3xl">
            {area.name} dispensary
            <span className="block text-indigo-300/90 font-semibold text-xl sm:text-2xl md:text-3xl mt-2">
              {STORE.name} · {area.driveMins} min from {area.name}
            </span>
          </h1>
          <p className="text-base sm:text-lg text-indigo-100/90 leading-relaxed max-w-2xl mb-7">
            {area.pitch}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-2xl bg-indigo-300 hover:bg-indigo-200 text-indigo-950 font-bold text-sm transition-all shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950"
            >
              Browse menu
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/visit"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              Hours + directions
            </Link>
            <a
              href={`tel:${STORE.phoneTel}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-white/85 hover:text-white text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              <span aria-hidden="true">📞</span>
              {STORE.phone}
            </a>
          </div>
        </div>
      </section>

      {/* ── STAT TILES ──────────────────────────────────────────────────
          Three tiles below the hero — drive time / transit / open-
          daily hours. Bigger numbers, white cards on stone bg (visible
          weight), grid-cols-2 stacks "Open daily" tile below on phones
          so the eye lands on Drive time + Transit first (the load-
          bearing facts for a customer scanning a near-area landing
          page in Seattle, where transit is a real alternative to a
          drive). Sister glw v33.805 stat-tile band.
      */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 mb-10 sm:mb-14 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-2xl bg-white border border-stone-200 shadow-sm px-4 sm:px-5 py-4">
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-700 mb-1.5">
              Drive time
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-stone-900 tabular-nums leading-none">
              {area.driveMins}
              <span className="text-base sm:text-lg font-semibold text-stone-500 ml-1">min</span>
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-stone-200 shadow-sm px-4 sm:px-5 py-4">
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-700 mb-1.5">
              Transit
            </div>
            <div className="text-xs sm:text-sm font-semibold text-stone-900 leading-snug">
              {area.transit}
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white border border-stone-200 shadow-sm px-4 sm:px-5 py-4">
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-700 mb-1.5">
              Open daily
            </div>
            <div className="text-sm sm:text-base font-semibold text-stone-900 tabular-nums leading-snug">
              {hoursSummaryStatic}
            </div>
          </div>
        </div>
      </section>

      {/* ── LONG-FORM LOCAL CONTEXT ─────────────────────────────────────
          Long-form section ABOVE the standard whyStop so Google sees the
          heavier body copy first. Prose width capped at max-w-2xl
          (~65ch) for comfortable reading on desktop. Each paragraph
          break gets natural rhythm via prose-stone + mb-5. Section h2
          carries the SEO phrase ("Cannabis dispensary near {area}")
          + an eyebrow above for visual hierarchy.
      */}
      {area.cityCopy && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-700 mb-2">
              About the trip
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mb-6 leading-tight">
              Cannabis dispensary near {area.name}, Seattle
            </h2>
            <div className="prose prose-stone prose-base sm:prose-lg max-w-none prose-p:text-stone-700 prose-p:leading-relaxed prose-p:mb-5 prose-strong:text-stone-900">
              {area.cityCopy.split("\n\n").map((para, i) => (
                <p key={i} {...(i === 0 ? { "data-speakable": "" } : {})}>{para}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── WHY STOP + STORE FACTS ──────────────────────────────────────
          Compact 2-section block: short whyStop paragraph + 4 fact
          chips (address / payment / ID / parking) replacing the
          previous wall-of-text "We're at … free parking out front, ADA
          accessible …" prose. Chips render as a tight grid on desktop
          and stack on mobile. Sister glw v33.805 chip grid.
      */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
        <div className="max-w-2xl mb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-700 mb-2">
            Why stop in
          </p>
          <p className="text-base sm:text-lg text-stone-700 leading-relaxed">
            {area.whyStop}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-3xl">
          <div className="rounded-xl bg-white border border-stone-200 px-3 sm:px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Address</div>
            <div className="text-xs sm:text-sm font-semibold text-stone-900 leading-snug" data-speakable>
              {STORE.address.street}
            </div>
            <div className="text-xs text-stone-500 mt-0.5">{STORE.neighborhood}, Seattle</div>
          </div>
          <div className="rounded-xl bg-white border border-stone-200 px-3 sm:px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Payment</div>
            <div className="text-xs sm:text-sm font-semibold text-stone-900">Cash only</div>
            <div className="text-xs text-stone-500 mt-0.5">ATM in lobby</div>
          </div>
          <div className="rounded-xl bg-white border border-stone-200 px-3 sm:px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">ID</div>
            <div className="text-xs sm:text-sm font-semibold text-stone-900">21+, gov ID</div>
            <div className="text-xs text-stone-500 mt-0.5">Out-of-state OK</div>
          </div>
          <div className="rounded-xl bg-white border border-stone-200 px-3 sm:px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Parking</div>
            <div className="text-xs sm:text-sm font-semibold text-stone-900">Free, out front</div>
            <div className="text-xs text-stone-500 mt-0.5">ADA accessible</div>
          </div>
        </div>
      </section>

      {/* ── CTA BAND ────────────────────────────────────────────────────
          Full-width indigo/violet gradient CTA band matching the
          /visit + / "Ready to order?" pattern. Sticky-feeling, hard-
          to-miss prompt that gives the page a clear conversion
          endpoint. The previous emerald-bordered box was the only CTA
          and was visually equivalent to a callout — this band reads
          as the page's primary action. Sister glw v33.805 green-950
          CTA band (indigo/violet here).
      */}
      <section className="bg-gradient-to-br from-indigo-950 via-violet-950 to-indigo-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="max-w-md">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-300 mb-2">
                Coming from {area.name}?
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 leading-tight">
                Order on the way, pick up when you arrive.
              </h2>
              <p className="text-indigo-200/80 text-sm sm:text-base leading-relaxed">
                Browse the live menu, place a pickup order, and we&apos;ll have it pulled and bagged. Cash only at the counter.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/menu"
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

      {/* ── OTHER AREAS ─────────────────────────────────────────────────
          Compact card grid (2-col mobile, 3-col tablet+) replacing the
          plain 2-column bullet list. Each card has the area + drive
          time + a subtle hover state. This is the internal-link
          cluster Google uses to crawl the rest of the /near network.
          Sister glw v33.805 other-towns card grid.
      */}
      {otherAreas.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="mb-6 sm:mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-700 mb-2">
              Other neighborhoods we serve
            </p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
              From everywhere in the south end
            </h2>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {otherAreas.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/near/${t.slug}`}
                  className="group block rounded-xl bg-white border border-stone-200 hover:border-indigo-400 hover:shadow-sm transition-all px-3 sm:px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm sm:text-base font-semibold text-stone-900 group-hover:text-indigo-800 transition-colors truncate">
                      {t.name}
                    </span>
                    <span className="text-xs font-semibold text-indigo-700 tabular-nums shrink-0">
                      {t.driveMins} min
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
