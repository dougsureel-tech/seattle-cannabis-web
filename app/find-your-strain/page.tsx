import type { Metadata } from "next";
import Link from "next/link";
import { STORE} from "@/lib/store";
import { StrainFinderClient } from "./StrainFinderClient";
import { withAttr } from "@/lib/attribution";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = {
  // v26.905 — SEO sweep matched /near + /strains: title carries the high-intent
  // "cannabis strain finder Seattle" / "best strain for me" long-tail phrase
  // pack; description keeps the descriptive what-it-does frame (WAC 314-55-155).
  // ${STORE.name} ends with "Co." — descriptions avoid trailing "." per
  // the v22.005 STORE.name double-period sweep.
  // title.absolute drops the layout template suffix so the rendered <title>
  // stays under Google's ~60-char SERP cap (em-dash is U+2014 single char).
  title: { absolute: "Cannabis Strain Finder Quiz — Seattle, WA" },
  description: `Cannabis strain finder for Rainier Valley and South Seattle. Three questions — moment, format, strain type — and we filter the live menu at ${STORE.name} Same crew since 2010, pre-I-502.`,
  keywords: [
    "cannabis strain finder",
    "find your weed strain",
    "cannabis quiz Seattle",
    "strain finder Washington",
    "best cannabis strain for me",
    "indica sativa hybrid quiz",
    "Rainier Valley dispensary quiz",
  ],
  alternates: { canonical: "/find-your-strain" },
  openGraph: {
    siteName: STORE.name,
    locale: "en_US",
    title: `Cannabis Strain Finder — Free Quiz | ${STORE.name}`,
    description: "Three questions, live menu, real staff. Cannabis strain finder for Rainier Valley.",
    url: `${STORE.website}/find-your-strain`,
    type: "website",
    images: [{ url: "/find-your-strain/opengraph-image", width: 1200, height: 630, alt: `${STORE.name}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Cannabis Strain Finder — Free Quiz | ${STORE.name}`,
    description: "Three questions, live menu, real staff. Seattle, WA.",
    images: [{ url: "/find-your-strain/opengraph-image", width: 1200, height: 630, alt: `${STORE.name} — cannabis strain finder quiz` }],
  },
};

// Mood shortcuts under the quiz — for visitors who already know what they
// want and don't need to walk three steps. Each one deep-links to /menu
// with the same `vibe` + (optional) `strain` params the quiz emits, plus
// attribution so we can compare quiz-completion vs shortcut-skip routes.
// (Boost embed on /menu ignores the params today; they survive the
// redirect-free hop in case Boost adds support later — see v16.405.)
const MOOD_SHORTCUTS: { label: string; emoji: string; vibe: string; strain?: string; sub: string }[] = [
  { label: "Wind down", emoji: "🌙", vibe: "chill", strain: "indica", sub: "End-of-day indica" },
  { label: "Get going", emoji: "☀️", vibe: "energize", strain: "sativa", sub: "Daytime sativa" },
  { label: "Sleepy", emoji: "💤", vibe: "sleep", strain: "indica", sub: "Bedtime body-heavy" },
  { label: "Creative", emoji: "🎨", vibe: "creative", strain: "hybrid", sub: "Flow-state hybrid" },
];

// v4.49 — Quiz schema (cross-port from Wenatchee). Answers AI engines
// getting "what cannabis strain should I pick" / "Seattle cannabis quiz"
// type queries. Plus the standard Breadcrumb + WebPage linkage so the
// strain-finder gets the same E-E-A-T credit as the rest of the site.
const finderSchema = {
  "@context": "https://schema.org",
  "@type": "Quiz",
  name: `Find Your Strain · ${STORE.name}`,
  url: `${STORE.website}/find-your-strain`,
  about: { "@id": `${STORE.website}/#dispensary` },
  educationalAlignment: {
    "@type": "AlignmentObject",
    alignmentType: "educationalSubject",
    targetName: "Cannabis selection guide",
  },
  hasPart: [
    { "@type": "Question", name: "What's the moment? (Chill, Energize, Sleepy, Creative, Social)" },
    {
      "@type": "Question",
      name: "What form do you prefer? (Flower, Pre-roll, Edible, Vape, Concentrate, Tincture)",
    },
    { "@type": "Question", name: "Which strain type? (Sativa, Indica, Hybrid, or no preference)" },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${STORE.website}/find-your-strain#breadcrumb`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
    { "@type": "ListItem", position: 2, name: "Find Your Strain", item: `${STORE.website}/find-your-strain` },
  ],
};

// v26.905 — FAQPage JSON-LD. Six Q&A targeting the long-tail search intent
// around strain-finder quizzes plus the most common counter questions our
// budtenders field. WAC 314-55-155 lane: every answer describes what the
// quiz DOES or what the shop DOES — never what a strain DOES. /menu CTA
// only. U+2019 apostrophes throughout. No exclamation marks. Sister glw
// v35.605 same-push.
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${STORE.website}/find-your-strain#faq`,
  mainEntity: [
    {
      "@type": "Question",
      name: "How does the strain finder quiz work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Three questions. First we ask the moment you have in mind (chill, energize, sleepy, creative, social). Then the format you prefer (flower, pre-roll, edible, vape, concentrate, tincture). Then the strain type if you have a preference (sativa, indica, hybrid, or no preference). We filter the live menu down to what fits and what’s actually on the shelf right now.",
      },
    },
    {
      "@type": "Question",
      name: "Is this quiz going to tell me the right strain for me?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It gets you in the right neighborhood. The quiz narrows the live menu to a manageable shortlist — from there, a budtender at the counter dials it the rest of the way. Cannabis is personal; the same lineage hits different people differently, and tolerance, format, and dose move the experience more than category does. Tell us what worked or didn’t work last time and we’ll adjust.",
      },
    },
    {
      "@type": "Question",
      name: "What’s the difference between indica, sativa, and hybrid?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The labels come from the plant’s botanical origin. Cannabis indica is short-stature, broad-leaf; cannabis sativa is tall-stature, narrow-leaf; hybrid is a cross of both. Modern Washington shelves are mostly hybrids — pure landrace genetics are rare. We have long-form pages at /strains/indica, /strains/sativa, /strains/hybrid, and /strains/cbd if you want the full breakdown.",
      },
    },
    {
      "@type": "Question",
      name: "Do you carry a specific strain I’m looking for?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `Check the live menu at ${STORE.website}/menu — it updates from our POS in real time, so what you see is what’s on the shelf. If a specific cultivar isn’t listed, call us at ${STORE.phone} and we’ll let you know if it’s coming in or suggest the closest sibling we have stocked.`,
      },
    },
    {
      "@type": "Question",
      name: "Can I order online for pickup?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `Yes. Browse the live menu at ${STORE.website}/menu, add to cart, and we’ll have it ready when you arrive. Bring valid ID and cash — we’re cash only with an ATM on site.`,
      },
    },
    {
      "@type": "Question",
      name: "What if my preferred strain isn’t in stock?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tell the budtender what you usually pick and why. Same lineage family, same dominant terpene profile, similar format, similar price point — there’s almost always a close cousin on the shelf. The quiz captures the shape of what you’re after; the counter conversation fills in the rest.",
      },
    },
  ],
};

export default function FindYourStrainPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(finderSchema) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema) }}
      />

      <Breadcrumb items={[{ label: "Find Your Strain" }]} />

      {/* Hero — soft decorative gradient behind the headline so the page
          stops looking like flat default white. The accent splash sits
          aria-hidden behind the text. */}
      <section className="relative overflow-hidden border-b border-stone-200 bg-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(199, 210, 254, 0.55), transparent), radial-gradient(circle at 100% 100%, rgba(196, 181, 253, 0.30), transparent 50%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-700">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse motion-reduce:animate-none" />
            3 questions · live menu
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
            Find your <span className="text-indigo-700">strain.</span>
          </h1>
          <p className="mt-3 text-stone-600 text-base sm:text-lg max-w-md mx-auto">
            Tell us the moment, the form, and the strain type. We&apos;ll filter the menu down to what fits.
          </p>
        </div>
      </section>

      {/* v26.905 — Long-form intro for SEO. Sits between hero + quiz so the
          quiz remains the primary action above-the-fold (visible in hero)
          while crawlers + LLMs get the educational payload. WAC 314-55-155
          STRICT: describes what the QUIZ does + how the SHOP works — never
          what strains do. Pre-I-502 / Rainier Valley framing per scc tenure
          memory pin. U+2019 apostrophes. No exclamation marks. */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-2">
        <div className="prose prose-stone prose-sm sm:prose-base max-w-none text-stone-700 leading-relaxed">
          <p className="text-base sm:text-lg text-stone-700 leading-relaxed">
            A cannabis menu is a wall of options — flower, pre-rolls, vapes,
            edibles, concentrates, tinctures, every one of them labeled
            sativa or indica or hybrid, every one of them with a cultivar
            name that doesn’t tell you much unless you already know what to
            look for. The strain finder cuts through that. Three questions
            about what you’re after — the moment you have in mind, the
            format you prefer, and whether you lean toward a strain type —
            and we filter the live menu down to what fits.
          </p>
          <p>
            The quiz is built around how budtenders actually talk to
            customers at our counter. We don’t start with the cultivar
            name. We start with the moment: a Tuesday-night wind-down is a
            different conversation than a Saturday hike, and a first-time
            edible run is a different conversation than someone restocking
            their usual cart. From there, format matters — some people only
            smoke flower, some people want a discreet vape, some people are
            here for a 5-mg gummy and nothing else. Strain type is the
            third filter, optional because plenty of regulars already know
            they don’t care about the indica/sativa label and just want
            something that smells right.
          </p>
          <p>
            What you get back is a shortlist from the live menu — what’s on
            the shelf right now in {STORE.neighborhood}, not what was here
            last week. If you want to take it the rest of the way, walk in
            or call us at {STORE.phone}. {STORE.name} started in 2010 as a
            medical collective on Rainier Ave S, pre-I-502 — we’ve been
            helping customers find what works since before recreational was
            legal. The quiz gets you in the neighborhood; the counter
            conversation finds the right house.
          </p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <StrainFinderClient />
      </section>

      {/* Mood shortcuts — explicit "skip the quiz" lane for repeat customers
          who already know what they want. Same query-param contract as the
          quiz redirect. */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400 text-center mb-3">
          Already know the vibe? Skip ahead
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {MOOD_SHORTCUTS.map((m) => {
            const params = new URLSearchParams({ vibe: m.vibe });
            if (m.strain) params.set("strain", m.strain);
            return (
              <Link
                key={m.label}
                href={withAttr(`/menu?${params.toString()}`, "quiz", `shortcut-${m.vibe}`)}
                className="group rounded-xl border border-stone-200 bg-white px-3 py-3 text-center hover:border-indigo-300 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <div className="text-xl mb-0.5" aria-hidden>{m.emoji}</div>
                <div className="text-xs font-bold text-stone-900 group-hover:text-indigo-700">{m.label}</div>
                <div className="text-[10px] text-stone-500 mt-0.5 leading-snug">{m.sub}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How-we-match trust strip — three micro-cards in budtender voice.
          Seattle leans on the "since 2010" longevity thread (project memory:
          founded 2010, Rainier Valley since 2018) — the rare "we've been
          here longer than legal weed" angle. No efficacy claims. */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="text-2xl mb-2" aria-hidden>🌿</div>
            <div className="text-sm font-bold text-stone-900 mb-1">Live menu</div>
            <p className="text-xs text-stone-600 leading-relaxed">
              We filter what&apos;s actually on the shelf right now in {STORE.neighborhood}. No vapor-ware,
              no &ldquo;coming soon.&rdquo;
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="text-2xl mb-2" aria-hidden>🏠</div>
            <div className="text-sm font-bold text-stone-900 mb-1">Same crew since 2010</div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Pre-I-502 origin, Rainier Valley since 2018. Same crew, same instinct — tell us what worked
              and what didn&apos;t and we&apos;ll dial it.
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="text-2xl mb-2" aria-hidden>🤝</div>
            <div className="text-sm font-bold text-stone-900 mb-1">No shame, no rush</div>
            <p className="text-xs text-stone-600 leading-relaxed">
              First time, fifteenth time, didn&apos;t love your last one — tell us. We&apos;ll find better
              together.
            </p>
          </div>
        </div>
      </section>

      {/* Stuck? — three explicit out-of-quiz lanes (call, walk-in, browse)
          so the page never dead-ends. */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-10">
        <div className="rounded-2xl bg-stone-100 border border-stone-200 p-5 text-center">
          <p className="text-sm font-bold text-stone-800 mb-1">Stuck on the quiz?</p>
          <p className="text-xs text-stone-600 mb-3">
            We&apos;d rather hear from you than have you guess. Three easy ways to skip ahead:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <a
              href={`tel:${STORE.phoneTel}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-stone-200 text-xs font-bold text-stone-800 hover:border-indigo-300 hover:text-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <span aria-hidden="true">📞 </span>Call {STORE.phone}
            </a>
            <Link
              href={withAttr("/visit", "quiz", "stuck-visit")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-stone-200 text-xs font-bold text-stone-800 hover:border-indigo-300 hover:text-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <span aria-hidden="true">📍 </span>Walk in
            </Link>
            <Link
              href={withAttr("/menu", "quiz", "stuck-browse")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-stone-200 text-xs font-bold text-stone-800 hover:border-indigo-300 hover:text-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <span aria-hidden="true">🛒 </span>Browse everything
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-16 text-center">
        <p className="text-xs text-stone-400">
          Not legal advice. 21+. {STORE.name}, {STORE.address.city} WA.
          {" · "}
          <Link
            href={withAttr("/menu", "quiz", "footer-skip")}
            className="hover:text-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded px-1"
          >
            Skip and browse all →
          </Link>
        </p>
      </section>
    </div>
  );
}
