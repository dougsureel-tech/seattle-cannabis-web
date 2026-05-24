import type { Metadata } from "next";
import Link from "next/link";
import { STORE, DEFAULT_OG_IMAGE } from "@/lib/store";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { Breadcrumb } from "@/components/Breadcrumb";

// /visit/from-seatac — high-intent traveler-side landing page for
// SeaTac arrivals ("dispensary near Seattle airport", "weed near
// SeaTac", "cannabis SeaTac Light Rail"). Per SEO_CONTENT_DRAFTS_
// 2026_05_09 Tier-1 Draft 8. Static (force-static); no per-request
// DB calls.
//
// Targets "I just landed, where do I buy weed near the airport" intent
// with Light Rail directions, rental-car alternatives, and traveler-
// side legal context (don't fly with it, no public consumption).

export const dynamic = "force-static";
export const revalidate = false;

const TITLE = "From SeaTac to Seattle Cannabis Co — 25 minutes on Light Rail";
const DESCRIPTION =
  "Just landed at SeaTac? Seattle Cannabis Co is on Light Rail at Othello, 25 minutes from the airport. Open since 2010, cash-only, open til 11 PM.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} — ${STORE.name}` },
  description: DESCRIPTION,
  alternates: { canonical: "/visit/from-seatac" },
  openGraph: {
    type: "article",
    locale: "en_US",
    title: TITLE,
    description: DESCRIPTION,
    url: `${STORE.website}/visit/from-seatac`,
    siteName: STORE.name,
    images: [DEFAULT_OG_IMAGE],
  },
};

const BODY = `Just landed at SeaTac International? Seattle Cannabis Co is one Light Rail line away — 25 minutes north to Othello Station, then a 5-minute walk up Rainier Ave. The closest neighborhood cannabis shop to the airport, in the heart of Rainier Valley.

## Light Rail from the airport

The 1 Line (formerly Central Link) runs from SeaTac/Airport Station to downtown Seattle and through Rainier Valley. From the SeaTac terminal, follow the signs for Light Rail — the station is connected to the airport via the parking garage, about a 5-minute walk from baggage claim.

- **SeaTac/Airport Station → Othello Station** — 6 stops, about 20 minutes.
- **Othello Station → 7266 Rainier Ave S** — 5 minutes on foot, straight north up Rainier Ave.

Total door-to-door from baggage claim is 30-35 minutes if you don't dawdle.

The 1 Line runs every 8-12 minutes during the day and every 15 minutes evenings. Last northbound train from SeaTac departs around 12:30 AM.

## Driving from SeaTac

If you're picking up a rental:

- **Via I-5 north:** about 20 minutes to Rainier Ave exit, then surface streets to 7266 Rainier Ave S. Quickest.
- **Via MLK Jr Way S:** about 25 minutes, scenic-ish through the Rainier Valley.

Free parking out front — no parking-meter scramble.

## Hours that matter for an arrival

- **Open daily 8 AM to 11 PM.**
- **Pickup orders** — last online order is 15 minutes before close.

If your flight lands at 9 PM and you're hungry to grab something on the way to your hotel, you have time.

## What to bring

- **Valid 21+ photo ID.** Washington accepts out-of-state driver's licenses, US passports, US passport cards, military IDs, and Tribal IDs. International passports work too. Expired IDs do not.
- **Cash.** Every Washington dispensary is cash-only — federal law prevents the major card networks from processing for cannabis. ATM in the lobby ($3 surcharge typical).
- **A reusable bag** is convenient but not required.

## What travelers most often pick up

Visitors landing at SeaTac usually fall into two patterns at the counter:

- **Hotel-room evening** — pre-rolls (single or 5-pack), low-dose gummies (2.5 or 5 mg), small flower (eighths). Easy to dose, easy to travel within Washington.
- **Multi-day stay / Airbnb** — flower (eighths to quarters), edibles (10-piece packs), maybe a vape cartridge if they have a battery or pick up a disposable.

Worth knowing if you're new to a Washington dispensary: ask the budtender. Our first-time customer guide walks the door-to-bag experience. We'd rather have you ten minutes at the counter than guessing on the hotel-room couch.

## Critical legal stuff

- **Don't fly with it.** Cannabis is federally illegal — TSA can technically refer to local law enforcement, and even though Seattle is a no-prosecute jurisdiction, you absolutely cannot board a plane with cannabis. Consume in Washington, leave it in Washington.
- **Don't drive impaired.** Cannabis DUI is the same as alcohol DUI under Washington law. Light Rail and Lyft/Uber are widely available.
- **No consumption in public.** Hotel rooms with smoke-free policies are off-limits for smoking; vape pens are quieter and lower-odor for that exact reason. Edibles are the most discreet option.
- **No consumption on the dispensary property.** The exit bag is for transport, not for use in the parking lot.

## About the shop

Seattle Cannabis Co has been on Rainier Ave since 2018 — same neighborhood, same staff. The original shop opened in 2010, before Washington recreational cannabis was a thing (we're one of the oldest cannabis retail operations in the state). The Rainier Valley location is where we live now.

## Worth a side-trip

Out the door at SCC, you're in Rainier Valley — the most diverse zip code in America for years running, world-class food, and a five-minute walk in any direction is a different cuisine.

Worth a stop on the way to or from us:

- **Othello International Market** — a few blocks from the Light Rail station.
- **Big Chickie or Tutta Bella** — Hillman City, 5 min south.
- **Seward Park** — 7 min east, Lake Washington loop.
- **Columbia City Theater + the Columbia City restaurants** — 5 min north.

Welcome to Seattle. See you in 30.`;

export default function VisitFromSeaTacPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${STORE.website}/visit/from-seatac#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Visit", item: `${STORE.website}/visit` },
      {
        "@type": "ListItem",
        position: 3,
        name: "From SeaTac",
        item: `${STORE.website}/visit/from-seatac`,
      },
    ],
  };

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${STORE.website}/visit/from-seatac#article`,
    headline: TITLE,
    description: DESCRIPTION,
    inLanguage: "en-US",
    url: `${STORE.website}/visit/from-seatac`,
    isPartOf: { "@id": `${STORE.website}/visit` },
    publisher: { "@id": `${STORE.website}/#dispensary` },
    about: { "@id": `${STORE.website}/#dispensary` },
  };

  const businessLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${STORE.website}/#dispensary`,
    mainEntityOfPage: { "@id": `${STORE.website}/visit/from-seatac` },
    name: STORE.name,
    url: STORE.website,
    address: {
      "@type": "PostalAddress",
      streetAddress: STORE.address.street,
      addressLocality: STORE.address.city,
      addressRegion: STORE.address.state,
      postalCode: STORE.address.zip,
      addressCountry: "US",
    },
    telephone: STORE.phoneTel,
  };

  const sections = renderBody(BODY);

  return (
    <main className="bg-zinc-950 text-zinc-100 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(businessLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleLd) }} />

      <Breadcrumb
        items={[
          { label: "Visit", href: "/visit" },
          { label: "From SeaTac" },
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
            <span>From SeaTac</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1] mb-4">
            {TITLE}
          </h1>
          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl">
            {DESCRIPTION}
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
            Browse the live menu before you ride.
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

// Minimal markdown-like renderer — `## ` → h2, blank-line-separated
// paragraphs → p, `- ` consecutive lines → ul, `**bold**` inline.
// Sister of the renderer in app/learn/[slug]/page.tsx.
function renderBody(body: string): React.ReactNode {
  const blocks: React.ReactNode[] = [];
  const lines = body.split("\n");
  let para: string[] = [];
  let list: string[] = [];
  let key = 0;

  const flushPara = () => {
    if (para.length === 0) return;
    blocks.push(<p key={`p-${key++}`}>{renderInline(para.join(" "))}</p>);
    para = [];
  };
  const flushList = () => {
    if (list.length === 0) return;
    blocks.push(
      <ul key={`ul-${key++}`} className="list-disc pl-6">
        {list.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("## ")) {
      flushPara();
      flushList();
      blocks.push(<h2 key={`h2-${key++}`}>{line.slice(3)}</h2>);
    } else if (line.startsWith("- ")) {
      flushPara();
      list.push(line.slice(2));
    } else if (line === "") {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return blocks;
}

function renderInline(text: string): React.ReactNode {
  if (!text.includes("**")) return text;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    }
    return <span key={i}>{p}</span>;
  });
}
