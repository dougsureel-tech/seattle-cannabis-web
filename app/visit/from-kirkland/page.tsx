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

// /visit/from-kirkland — east-side driver-side landing page for Kirkland
// residents. North of Bellevue, 520 corridor. Same SCC-specific
// differentiator framing as /visit/from-bellevue: open til 11 PM,
// neighborhood shop continuity, deeper menu. Per the SEO_AUDIT_AUTONOMOUS_
// WINS_2026_05_26 Tech-SEO #3 cross-stack parity scope. Static (force-
// static); no per-request DB calls.

export const dynamic = "force-static";
export const revalidate = false;

const CONFIG: VisitFromSourceConfig = {
  slug: "kirkland",
  sourceName: "Kirkland",
  title: "From Kirkland: 30 minutes south to Seattle Cannabis Co",
  description:
    "From Kirkland, Seattle Cannabis Co is 30 minutes south via 520 + I-5 — open until 11 PM daily, free parking, ATM on-site.",
  body: `Kirkland has its own recreational dispensaries inside city limits, plus a couple of close-by Redmond and Bellevue options. Kirkland regulars who drive across the lake to Seattle Cannabis Co usually do it for the late hours, the neighborhood-shop continuity (operator-owned since 2010, well before I-502 retail launched), and the deeper menu that comes with a higher-volume Seattle location.

## The drive

520 west across Lake Washington, south on I-5 to the Spokane St / Columbian Way exit, surface streets east to 7266 Rainier Ave S in Rainier Valley. Free parking out front.

- **From Kirkland Marina:** 16.2 miles, about 30 min off-peak. SR 520 toll applies.
- **From the Kirkland-Redmond border (Totem Lake):** 17.8 miles, about 32 min.
- **From Houghton / South Kirkland:** 15.5 miles, about 28 min.

Route alternatives most Kirkland drivers won't consider:

- **520 + I-5:** the default. Direct + reliable off-peak.
- **I-405 south to I-90 west:** about 35 min. Toll-free if you avoid the 405 express lanes. Worth it if 520 is backed up (which happens regularly between 4-6 PM weekdays).
- **520 + I-5 via the floating bridge bike-trail spur to Rainier Ave directly:** if you're an e-biker or coming back from a Bothell ride, this is the route most won't think of. Not faster, just scenic.

## Hours that matter for the drive

- **Open daily 8 AM to 11 PM** — including Sundays + holidays.
- **Pickup orders** — last online order is 15 minutes before close.

If you're crossing the lake for dinner in Capitol Hill or a show downtown and want to swing by us on the way home, the 9-to-11 PM window is the typical Kirkland pattern. Most east-side dispensaries close by 10 PM, which is why the late hour matters.

## What to bring

- **Valid 21+ photo ID.** Washington accepts out-of-state driver's licenses, US passports, US passport cards, military IDs, and Tribal IDs. International passports work too. Expired IDs do not.
- **Cash.** Every Washington dispensary is cash-only — federal law prevents the major card networks from processing for cannabis. ATM in the lobby ($3 surcharge typical).
- **A reusable bag** is convenient but not required.

## What Kirkland customers typically pick up

Kirkland customers tend to fall into a few patterns at the counter:

- **Late-night pickup** — pre-rolls (single or 5-pack), small flower (eighths), low-dose gummies (2.5 or 5 mg). Most common 9-11 PM trip purpose.
- **Multi-day stock-up** — flower (quarters or halves), edibles (10-piece packs), vape cartridges. Worth the cross-lake trip if you're already in Seattle for dinner or work.
- **Browser stop** — coming over because the menu's deeper or a specific brand isn't carried east-side. We carry roughly 250 active SKUs across categories on a typical weekday.

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

See you in 30.`,
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

export default function VisitFromKirklandPage() {
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
