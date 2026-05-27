import type { Metadata } from "next";
import Link from "next/link";
import { STORE, DEFAULT_OG_IMAGE } from "@/lib/store";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  renderVisitFromSourceBody,
  visitFromSourceArticleLd,
  visitFromSourceBreadcrumbLd,
  visitFromSourceLocalBusinessLd,
  visitFromSourceUrl,
  type VisitFromSourceConfig,
} from "@/lib/visit-from-source-render";

// /visit/from-bellevue — east-side driver-side landing page for Bellevue
// residents considering a cross-lake trip. The east side has its own
// dispensaries, so this page sells the SCC-specific differentiators
// (open til 11 PM, Rainier Valley shop with operator continuity back
// to 2010, factual hours / cash / ID). Per the SEO_AUDIT_AUTONOMOUS_WINS_
// 2026_05_26 Tech-SEO #3 cross-stack parity scope. Static (force-static);
// no per-request DB calls.

export const dynamic = "force-static";
export const revalidate = false;

const CONFIG: VisitFromSourceConfig = {
  slug: "bellevue",
  sourceName: "Bellevue",
  title: "From Bellevue: 25 minutes south to Seattle Cannabis Co",
  description:
    "From Bellevue, Seattle Cannabis Co is 25 minutes south via I-90 + I-5 — open until 11 PM daily, free parking, ATM on-site.",
  body: `Bellevue has its own recreational dispensaries inside city limits. The reason east-side regulars drive across the lake to Seattle Cannabis Co is the late hours, the neighborhood-shop continuity (the original opened in 2010, well before I-502 retail launched), and the deeper menu that comes with a higher-volume Seattle location.

## The drive

I-90 west over Mercer Island to Seattle, south on I-5 to the Spokane St / Columbian Way exit, surface streets east to 7266 Rainier Ave S in Rainier Valley. Free parking out front.

- **From Bellevue Square:** 11.4 miles, about 25 min, no toll (I-90 is free).
- **From Bellevue Downtown Park:** 11.7 miles, about 25 min.
- **From the Microsoft main campus (Redmond corridor):** 14.5 miles, about 30 min.

Two route alternatives most east-siders won't be aware of:

- **520 + I-5:** about 30 min off-peak but you'll pay the SR 520 toll. Slightly less reliable in PM commute.
- **I-90 + Rainier Ave direct (no I-5):** about 28 min off-peak, scenic via the I-90 floating bridge directly onto Rainier Ave. Adds 3 min on average but skips the I-5 north-of-Columbian merge.

## Hours that matter for the drive

- **Open daily 8 AM to 11 PM** — including Sundays + holidays.
- **Pickup orders** — last online order is 15 minutes before close.

If you're crossing the lake for dinner in Columbia City or a show at the Royal Room and want to swing by us after, you have until 11 PM. Most east-side dispensaries close by 10 PM.

## What to bring

- **Valid 21+ photo ID.** Washington accepts out-of-state driver's licenses, US passports, US passport cards, military IDs, and Tribal IDs. International passports work too. Expired IDs do not.
- **Cash.** Every Washington dispensary is cash-only — federal law prevents the major card networks from processing for cannabis. ATM in the lobby ($3 surcharge typical).
- **A reusable bag** is convenient but not required.

## What east-side customers typically pick up

Bellevue + east-side customers tend to fall into a few patterns:

- **Late-night pickup** — pre-rolls (single or 5-pack), small flower (eighths), low-dose gummies (2.5 or 5 mg). The 9-to-11 PM window is roughly 40% of an east-side trip.
- **Multi-day stock-up** — flower (quarters or halves), edibles (10-piece packs), vape cartridges. Worth the cross-lake trip when you're already heading west for dinner or work.
- **Cross-shop browsing** — coming over because the menu's deeper. We carry roughly 250 active SKUs across categories on a typical weekday.

If you're new to a Washington dispensary, take 10 minutes at the counter — we'll walk you through the menu. Our first-time customer guide covers the door-to-bag walkthrough if you want to read ahead.

## Critical legal stuff

- **No consumption in public.** Hotel rooms with smoke-free policies are off-limits for smoking; vape pens are quieter and lower-odor. Edibles are the most discreet option.
- **Don't drive impaired.** Cannabis DUI is the same as alcohol DUI under Washington law. Plan a designated driver, Lyft, or stay over.
- **No consumption on the dispensary property.** The exit bag is for transport, not for use in the parking lot.
- **You cannot legally cross into Idaho with cannabis.** It's federally illegal everywhere AND state-illegal in Idaho specifically. Take it home in WA.

## About the shop

Seattle Cannabis Co has been on Rainier Ave since 2018 — same neighborhood, same staff. The original shop opened in 2010, before Washington recreational cannabis was a thing (we're one of the oldest cannabis retail operations in the state). The Rainier Valley location is where we live now.

## Pair it with

If you're crossing the lake anyway, worth knowing what's in the neighborhood:

- **Columbia City restaurants** — 5 min north of us, walkable village strip.
- **Othello International Market** — 3 min south, weekend grocery run.
- **Seward Park** — 7 min east, Lake Washington loop and old-growth forest.
- **Hillman City + Big Chickie** — 5 min south, late-night pickup chicken.

See you in 25.`,
};

export const metadata: Metadata = {
  title: { absolute: `${CONFIG.title} — ${STORE.name}` },
  description: CONFIG.description,
  alternates: { canonical: `/visit/from-${CONFIG.slug}` },
  openGraph: {
    type: "article",
    locale: "en_US",
    title: CONFIG.title,
    description: CONFIG.description,
    url: visitFromSourceUrl(CONFIG.slug),
    siteName: STORE.name,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function VisitFromBellevuePage() {
  const breadcrumbLd = visitFromSourceBreadcrumbLd(CONFIG);
  const articleLd = visitFromSourceArticleLd(CONFIG);
  const businessLd = visitFromSourceLocalBusinessLd(CONFIG);
  const sections = renderVisitFromSourceBody(CONFIG.body);

  return (
    <main className="bg-zinc-950 text-zinc-100 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(businessLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleLd) }} />

      <Breadcrumb
        items={[
          { label: "Visit", href: "/visit" },
          { label: `From ${CONFIG.sourceName}` },
        ]}
      />

      <section className="relative overflow-hidden border-b border-indigo-900/40 bg-gradient-to-br from-indigo-950 via-zinc-950 to-zinc-950">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-10 sm:pt-12 sm:pb-14">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-400 mb-3">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>From {CONFIG.sourceName}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1] mb-4">
            {CONFIG.title}
          </h1>
          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl">
            {CONFIG.description}
          </p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="prose prose-invert prose-zinc prose-lg max-w-none
          prose-headings:text-white prose-headings:tracking-tight
          prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4
          prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:mb-5
          prose-strong:text-zinc-100
          prose-ul:my-5 prose-li:text-zinc-300 prose-li:my-1
          prose-a:text-indigo-400 hover:prose-a:text-indigo-300">
          {sections}
        </div>
      </article>

      <section className="border-y border-indigo-900/40 bg-gradient-to-br from-indigo-950 to-zinc-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-400 mb-2">
            Plan ahead
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
            Browse the live menu before you drive.
          </h2>
          <p className="text-zinc-300 leading-relaxed mb-5 max-w-xl">
            Same products in our case. Pre-order online, walk in, hand the budtender your name at the counter, in and out in five.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-colors"
            >
              Browse the menu →
            </Link>
            <Link
              href="/visit"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 hover:border-zinc-500 px-6 py-3 text-sm font-medium text-zinc-200 hover:bg-zinc-900 transition-colors"
            >
              Hours, address, parking
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-xs text-zinc-500 text-center leading-relaxed">
          {STORE.name} · {STORE.address.full} · {STORE.phone} · 21+ with valid ID · Cash only, ATM on-site
        </p>
      </div>
    </main>
  );
}
