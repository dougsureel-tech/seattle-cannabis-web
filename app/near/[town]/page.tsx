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
      // Explicit reference to the root opengraph-image.tsx route — without
      // it, Next 16 fully replaces the parent's auto-injected images and
      // /near share previews come up imageless on Slack/iMessage/Facebook.
      images: ["/opengraph-image"],
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
  };

  // BreadcrumbList — Google renders the path under the SERP result
  // (Home › Visit › <neighborhood>) instead of just the URL string,
  // which earns 1-2% CTR per Search Console A/Bs. Mirrors the visible
  // breadcrumb nav rendered below.
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Visit", item: `${STORE.website}/visit` },
      { "@type": "ListItem", position: 3, name: area.name, item: `${STORE.website}/near/${area.slug}` },
    ],
  };

  const otherAreas = NEAR_TOWNS.filter((t) => t.slug !== area.slug);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-16 text-zinc-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />

      <nav className="text-sm text-zinc-500 mb-4">
        <Link href="/" className="hover:underline">Home</Link>
        <span aria-hidden="true"> · </span>
        <Link href="/visit" className="hover:underline">Visit</Link>
        <span aria-hidden="true"> · </span>
        <span className="text-zinc-700">{area.name}</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
        {area.name} dispensary — {STORE.name}
      </h1>
      <p className="text-lg text-zinc-700 mb-6">{area.pitch}</p>

      <section className="grid grid-cols-2 gap-3 mb-8 text-sm">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
          <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Drive time</div>
          <div className="font-semibold">{area.driveMins} min</div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
          <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Transit</div>
          <div className="font-semibold text-xs leading-relaxed">{area.transit}</div>
        </div>
      </section>

      <section className="prose prose-zinc max-w-none mb-10">
        <p>{area.whyStop}</p>
        <p>
          We&apos;re at <strong>{STORE.address.full}</strong>. ATM in-store, free parking out front, ADA accessible.
          Cash only at the counter — browse the live menu and place a pickup order before you head over.
        </p>
      </section>

      <section className="rounded-lg border-2 border-emerald-700 bg-emerald-50 p-5 mb-10">
        <div className="text-emerald-900 font-semibold mb-2">Coming from {area.name}?</div>
        <p className="text-sm text-emerald-900/80 mb-4">
          Place a pickup order on the way — we&apos;ll have it ready when you arrive. Cash only at pickup.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/menu"
            className="inline-block rounded-md bg-emerald-700 hover:bg-emerald-600 px-5 py-2 text-white font-semibold text-sm transition-colors"
          >
            Browse menu →
          </Link>
          <Link
            href="/visit"
            className="inline-block rounded-md border border-emerald-700 hover:bg-emerald-100 px-5 py-2 text-emerald-700 font-semibold text-sm transition-colors"
          >
            Hours + directions
          </Link>
        </div>
      </section>

      {otherAreas.length > 0 && (
        <section className="border-t border-zinc-200 pt-8">
          <h2 className="text-sm uppercase tracking-wider text-zinc-500 font-semibold mb-3">
            Other neighborhoods we serve
          </h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {otherAreas.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/near/${t.slug}`}
                  className="text-emerald-700 hover:underline"
                >
                  {t.name} ({t.driveMins} min)
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
