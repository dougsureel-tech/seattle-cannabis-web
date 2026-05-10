import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { safeJsonLd } from "@/lib/json-ld-safe";

// Press kit page — exists so journalists, podcasters, local bloggers, and
// micro-influencers (Rainier Valley + South Seattle creators especially)
// can grab logo + facts + a quote-able story without having to email and
// wait. Every easy-to-cite link reduces the friction between "they
// considered writing about us" and "they actually wrote about us."

export const metadata: Metadata = {
  title: "Press · Media Kit",
  // ~150 chars — v11.005 length sweep.
  description: `Press kit for ${STORE.name} in ${STORE.neighborhood}, Seattle — logo, fact sheet, story, press contact. Journalists and cannabis writers welcome.`,
  alternates: { canonical: "/press" },
  robots: { index: true, follow: true },
};

const FOUNDED_YEAR = "2010";
const PRESS_EMAIL = STORE.email;

const FACTS: { label: string; value: string }[] = [
  { label: "Legal name", value: "Green Anne LLC dba Seattle Cannabis Co." },
  { label: "Trade name", value: STORE.name },
  { label: "Address", value: STORE.address.full },
  { label: "Phone", value: STORE.phone },
  { label: "Hours", value: "8 AM – 11 PM daily" },
  { label: "WSLCB License", value: STORE.wslcbLicense },
  { label: "Founded", value: FOUNDED_YEAR },
  { label: "Owner", value: "Green Anne LLC · locally owned, independent" },
  {
    label: "Region",
    value: `${STORE.neighborhood}, plus ${STORE.nearbyNeighborhoods.slice(0, 3).join(", ")}`,
  },
];

export default function PressPage() {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    name: `${STORE.name} press kit`,
    publisher: { "@type": "Organization", name: STORE.name, url: STORE.website },
    about: { "@id": `${STORE.website}/#dispensary` },
  };

  // BreadcrumbList — earns SERP path rendering (Home › Press).
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${STORE.website}/press#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Press", item: `${STORE.website}/press` },
    ],
  };

  return (
    <div className="bg-stone-50 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />

      <section className="bg-indigo-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300 mb-4">
            Press · Media Kit
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Press resources for <span className="text-indigo-300">{STORE.name}</span>.
          </h1>
          <p className="mt-5 text-indigo-100/70 text-lg max-w-2xl leading-relaxed">
            Logo, photos, fact sheet, founder quote, and a press contact — everything you need to write about
            us. No PR firm in the middle, no NDA, no waiting on a callback. Grab what you need and ship.
          </p>
          <div className="mt-7 flex flex-wrap gap-2 text-xs font-semibold">
            <a
              href="#facts"
              className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/15"
            >
              Fact sheet
            </a>
            <a
              href="#story"
              className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/15"
            >
              Story
            </a>
            <a
              href="#assets"
              className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/15"
            >
              Logo + photos
            </a>
            <a
              href="#contact"
              className="px-3.5 py-1.5 rounded-full bg-indigo-300 text-indigo-950 hover:bg-indigo-200"
            >
              Press contact →
            </a>
          </div>
        </div>
      </section>

      <section id="facts" className="border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">Fact sheet</h2>
          <p className="text-stone-500 text-sm mt-1.5">
            Copy/paste-friendly. If anything is wrong, tell us at{" "}
            <a
              href={`mailto:${PRESS_EMAIL}?subject=${encodeURIComponent("Press fact-sheet correction")}`}
              className="text-indigo-700 font-semibold hover:text-indigo-600 underline underline-offset-2"
            >
              {PRESS_EMAIL}
            </a>{" "}
            and we&apos;ll fix it within the hour.
          </p>
          <dl className="mt-6 grid sm:grid-cols-2 gap-x-8 gap-y-4">
            {FACTS.map((f) => (
              <div key={f.label} className="border-b border-stone-200 pb-3">
                <dt className="text-[11px] font-bold uppercase tracking-wider text-stone-500">{f.label}</dt>
                <dd className="text-sm text-stone-900 mt-0.5 font-medium">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="story" className="border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">The story</h2>
          <div className="prose prose-stone max-w-none text-stone-700 text-base leading-relaxed">
            <p>
              {STORE.name} sits on Rainier Avenue in the heart of {STORE.neighborhood} — the corridor between
              Seward Park and Othello Station. Locally owned, neighborhood-staffed, stocked from
              Washington-state farms with an emphasis on smaller cultivators most chains skip. We stay open
              until 11 every night because South Seattle deserves more than the same three big-chain shops on
              MLK.
            </p>
            <p>
              The store has free parking, ADA access, dogs welcome, and an ATM on-site. Cash-only at the
              counter — federal banking law hasn&apos;t caught up to state legalization — but online orders
              are easy and pickup is five minutes from car to drawer.
            </p>
          </div>
          <blockquote className="border-l-4 border-indigo-700 pl-5 py-1 text-stone-700 italic">
            &ldquo;Rainier Valley deserves the same quality, the same service, the same care a customer in
            Capitol Hill or Bellevue gets. We built {STORE.name} to be that — same hours, same selection, same
            answers, half the attitude.&rdquo;
            <footer className="mt-2 not-italic text-xs text-stone-500">— the owner</footer>
          </blockquote>
          <p className="text-xs text-stone-500">
            Need a custom quote, owner interview, or background-only call? Email{" "}
            <a
              href={`mailto:${PRESS_EMAIL}?subject=${encodeURIComponent("Press — interview request")}`}
              className="text-indigo-700 font-semibold hover:text-indigo-600 underline underline-offset-2"
            >
              {PRESS_EMAIL}
            </a>{" "}
            and we&apos;ll schedule.
          </p>
        </div>
      </section>

      <section id="assets" className="border-b border-stone-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">Logo & photos</h2>
          <p className="text-stone-500 text-sm">
            Right-click → Save image. For SVG / vector / hi-res original variants, email{" "}
            <a
              href={`mailto:${PRESS_EMAIL}?subject=${encodeURIComponent("Press — high-res asset request")}`}
              className="text-indigo-700 font-semibold hover:text-indigo-600 underline underline-offset-2"
            >
              {PRESS_EMAIL}
            </a>{" "}
            — we&apos;ll send within an hour during business hours.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 text-center space-y-3">
              <div className="aspect-square w-32 mx-auto rounded-2xl bg-gradient-to-br from-indigo-700 via-violet-700 to-indigo-800 flex items-center justify-center">
                <span className="text-white font-bold text-3xl tracking-tight">SC</span>
              </div>
              <p className="text-sm font-semibold text-stone-900">Primary logo (PNG, 512×512)</p>
              <a
                href="/icon-512.png"
                download="seattle-cannabis-co-logo-512.png"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-700 hover:text-indigo-600"
              >
                Download →
              </a>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 text-center space-y-3">
              <div className="aspect-square w-32 mx-auto rounded-2xl bg-indigo-950 flex items-center justify-center">
                <span className="text-indigo-300 font-bold text-base leading-tight text-center px-2">
                  Seattle
                  <br />
                  <span className="font-normal">Cannabis Co.</span>
                </span>
              </div>
              <p className="text-sm font-semibold text-stone-900">Social-share image (1200×630)</p>
              <a
                href="/opengraph-image"
                download="seattle-cannabis-co-og.png"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-700 hover:text-indigo-600"
              >
                Download →
              </a>
            </div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-bold">Quick logo-usage notes</p>
            <ul className="mt-2 space-y-1 text-xs leading-relaxed list-disc pl-5">
              <li>Don&apos;t recolor the SC mark. The indigo is part of the brand.</li>
              <li>Don&apos;t pair with imagery that appeals to minors (per WAC 314-55-155).</li>
              <li>You don&apos;t need to ask permission to write about us. We appreciate when you do.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-indigo-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">Press contact</h2>
          <p className="text-indigo-100/80 max-w-2xl leading-relaxed">
            Direct to the owner. Story pitches, interview requests, fact-check questions, sample requests,
            background-only calls — all welcome. Same-day response during business hours.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:${PRESS_EMAIL}?subject=Press%20inquiry`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-300 text-indigo-950 font-bold text-sm hover:bg-indigo-200"
            >
              {PRESS_EMAIL} →
            </a>
            <a
              href={`tel:${STORE.phoneTel}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10"
            >
              {STORE.phone}
            </a>
          </div>
          <div className="pt-4 text-xs text-indigo-200/60 border-t border-white/10">
            Other useful pages:{" "}
            <Link href="/about" className="underline hover:text-indigo-300">
              About
            </Link>{" "}
            ·{" "}
            <Link href="/visit" className="underline hover:text-indigo-300">
              Visit us
            </Link>{" "}
            ·{" "}
            <Link href="/menu" className="underline hover:text-indigo-300">
              Live menu
            </Link>
            .
          </div>
        </div>
      </section>
    </div>
  );
}
