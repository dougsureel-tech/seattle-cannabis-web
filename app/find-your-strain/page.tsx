import type { Metadata } from "next";
import Link from "next/link";
import { STORE} from "@/lib/store";
import { StrainFinderClient } from "./StrainFinderClient";
import { withAttr } from "@/lib/attribution";
import { safeJsonLd } from "@/lib/json-ld-safe";

export const metadata: Metadata = {
  title: "Find Your Strain — 3-Question Quiz",
  // ~155 chars — v11.005 length sweep.
  description: `Quick 3-question quiz to match you with the right cannabis at ${STORE.name}. Pick a moment, a form, and a strain type — we filter the live menu.`,
  alternates: { canonical: "/find-your-strain" },
  openGraph: {
    siteName: STORE.name,
    locale: "en_US",
    title: `Find Your Strain | ${STORE.name}`,
    description: "Quick 3-question quiz to match you with the right cannabis. Live menu in Rainier Valley, Seattle.",
    url: `${STORE.website}/find-your-strain`,
    type: "website",
    images: [{ url: "/find-your-strain/opengraph-image", width: 1200, height: 630, alt: `${STORE.name}` }],
  },
};

// Mood shortcuts under the quiz — for visitors who already know what they
// want and don't need to walk three steps. Each one deep-links to /order
// with the same `vibe` + (optional) `strain` params the quiz emits, plus
// attribution so we can compare quiz-completion vs shortcut-skip routes.
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
    { "@type": "Question", name: "What's the moment? (Energize, Chill, Sleep, Creative, Social, Relief)" },
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

export default function FindYourStrainPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(finderSchema) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />

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
                href={withAttr(`/order?${params.toString()}`, "quiz", `shortcut-${m.vibe}`)}
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
            <div className="text-sm font-bold text-stone-900 mb-1">Locally-owned since 2010</div>
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
