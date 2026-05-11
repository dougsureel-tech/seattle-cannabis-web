import type { Metadata } from "next";
import Link from "next/link";
import { STORE, STORE_TZ, isOpenNow, nextOpenLabel} from "@/lib/store";
import { withAttr } from "@/lib/attribution";
import { fetchClosureStatus } from "@/lib/closure-status";
import { ClosureBanner } from "@/components/ClosureBanner";
import { safeJsonLd } from "@/lib/json-ld-safe";

// ISR: only dynamic data is "is the store open NOW" + which day-row to
// highlight. 5-minute revalidate keeps that fresh enough that customers
// looking up hours pre-visit get the right "Open / Closed" state without
// a per-visit round-trip.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Visit — Hours, Parking, ID",
  // ~150 chars — v11.005 length sweep.
  description: `Visit ${STORE.name} at ${STORE.address.full}. Hours, parking, ID. 5 min from Othello Light Rail. ATM on-site.`,
  alternates: { canonical: "/visit" },
  keywords: [
    "Rainier Valley dispensary",
    "South Seattle dispensary",
    "Othello dispensary",
    "Seattle Cannabis Co hours",
    "dispensary near Othello Light Rail",
    "Rainier Valley cannabis store",
  ],
  openGraph: {
    siteName: STORE.name,
    locale: "en_US",
    title: `Visit ${STORE.name}`,
    description: `${STORE.address.full} · ${STORE.phone} · Free parking, near Othello Light Rail.`,
    url: `${STORE.website}/visit`,
    type: "website",
    images: [{ url: "/visit/opengraph-image", width: 1200, height: 630, alt: `${STORE.name}` }],
  },
};

const visitSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${STORE.website}/visit#page`,
  name: `Visit ${STORE.name}`,
  url: `${STORE.website}/visit`,
  about: { "@id": `${STORE.website}/#dispensary` },
  mainEntity: { "@id": `${STORE.website}/#dispensary` },
  description: `Hours, address, parking, what to bring. ${STORE.address.full}.`,
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${STORE.website}/visit#breadcrumb`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
    { "@type": "ListItem", position: 2, name: "Visit", item: `${STORE.website}/visit` },
  ],
};

const PARKING_NEARBY = [
  "Free dedicated parking on-site",
  "Othello Light Rail Station — 5 min walk",
  "ADA-accessible entrance, no curb step",
];

const WHAT_TO_BRING = [
  {
    emoji: "🪪",
    label: "Valid government ID",
    note: "21+ to enter — passports + out-of-state DLs both work",
  },
  {
    emoji: "💵",
    label: "Cash for the order",
    note: "Cannabis is federally illegal so banks won't process card payments",
  },
  { emoji: "🏧", label: "Or use our on-site ATM", note: "If you forgot — no judgment, happens daily" },
  { emoji: "📱", label: "Your phone", note: "For order pickup, loyalty lookup, and the menu" },
];

const NEARBY = [
  { name: "Othello Light Rail Station", direction: "5 min walk" },
  { name: "Seward Park", direction: "5 min south" },
  { name: "Columbia City", direction: "5 min north" },
  { name: "I-5 via Columbia City", direction: "Direct on-ramp" },
];

export default async function VisitPage() {
  const open = isOpenNow();
  const statusLabel = nextOpenLabel();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: STORE_TZ });
  const todayHours = STORE.hours.find((h) => h.day === today);
  // Customers landing here pre-drive should know if we've flagged today
  // closed via /admin/hours-override even when our static configured hours
  // would normally say "open". `{ revalidate: 60 }` opts the inner fetch
  // into Next's data cache: pre-fix the default `cache: "no-store"` was
  // forcing the whole page into full-dynamic mode (verified via curl —
  // `cache-control: private, no-cache, no-store, max-age=0` + `x-vercel-
  // cache: MISS` on every hit) DESPITE the `export const revalidate = 300`
  // at the top — `cache: "no-store"` on any internal fetch overrides the
  // page-level revalidate per Next 16 docs. Sister of glw v18.805 same
  // shape. /menu + /order intentionally keep `no-store` on this fetch —
  // those need freshest signal so a customer can't order during a closure.
  const closure = await fetchClosureStatus({ revalidate: 60 });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(visitSchema) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />

      {closure.isClosed && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <ClosureBanner closure={closure} />
        </div>
      )}

      {/* Hero — gradient bookend matches the homepage hero / footer / bottom
          CTAs. Same indigo→violet identity across every page. */}
      <section className="relative bg-gradient-to-br from-indigo-950 via-violet-950 to-indigo-950 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            // Two radial pools — indigo on the right, fuchsia on the bottom-
            // left — matching the homepage hero's mesh.
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 80% 50%, #818cf833, transparent), radial-gradient(ellipse 50% 60% at 20% 100%, #c026d322, transparent)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">Visit Us</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-2">{STORE.address.street}</h1>
          <p className="text-indigo-300/80 mt-2">
            {STORE.address.city}, {STORE.address.state} {STORE.address.zip}
          </p>

          <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border bg-white/5 border-white/15">
            <span
              className={`w-1.5 h-1.5 rounded-full ${open ? "bg-indigo-300 animate-pulse shadow-[0_0_6px_#a5b4fc]" : "bg-red-400"}`}
            />
            <span className={open ? "text-indigo-200" : "text-red-300"}>
              {statusLabel || (open ? "Open today" : "Closed today")}
            </span>
            {todayHours && (
              <span className="text-indigo-300/60 font-normal">
                · {todayHours.open}–{todayHours.close}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-7">
            <a
              href={STORE.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Get directions to ${STORE.name} on Google Maps (opens in new tab)`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-300 hover:bg-indigo-200 text-indigo-950 font-bold text-sm transition-all shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
              </svg>
              Get Directions
            </a>
            <Link
              href={withAttr("/menu", "menu", "visit-hero")}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              Order Ahead
            </Link>
            <a
              href={`tel:${STORE.phoneTel}`}
              aria-label={`Call ${STORE.name} at ${STORE.phone}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              <span aria-hidden="true">📞</span> {STORE.phone}
            </a>
          </div>
        </div>
      </section>

      {/* Trust strip — reinforces Seattle positioning between hero + hours.
          Per memory `project_seattle_founding` — founded 2010 (pre-I-502),
          Rainier Valley since 2018. Tenure-as-credential framing per Doug
          2026-05-02 directive (was "Locally-owned IS the framing here" before
          the ownership-change-coming sweep landed; arc-guard
          check-brand-voice-locally-owned.mjs enforces). */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8 text-center sm:text-left">
            <div className="flex sm:items-center sm:gap-3 flex-col sm:flex-row gap-1.5">
              <span className="text-2xl shrink-0" aria-hidden="true">🏡</span>
              <div>
                <div className="font-bold text-stone-900 text-sm">Same crew since 2010</div>
                <div className="text-stone-500 text-xs leading-snug">
                  Independent neighborhood dispensary — not a chain. Pre-I-502 origin.
                </div>
              </div>
            </div>
            <div className="flex sm:items-center sm:gap-3 flex-col sm:flex-row gap-1.5">
              <span className="text-2xl shrink-0" aria-hidden="true">🚉</span>
              <div>
                <div className="font-bold text-stone-900 text-sm">Rainier Valley since 2018</div>
                <div className="text-stone-500 text-xs leading-snug">
                  On Rainier Ave S, 5 min walk from Othello Light Rail.
                </div>
              </div>
            </div>
            <div className="flex sm:items-center sm:gap-3 flex-col sm:flex-row gap-1.5">
              <span className="text-2xl shrink-0" aria-hidden="true">🪪</span>
              <div>
                <div className="font-bold text-stone-900 text-sm">WSLCB licensed</div>
                <div className="text-stone-500 text-xs leading-snug">
                  License #{STORE.wslcbLicense}. Cash-only, 21+ with valid ID.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hours + Amenities */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Hours</h2>
            <p className="text-stone-600 text-sm mt-1">Open every day of the year, including holidays.</p>
            <table className="mt-5 w-full text-sm">
              <tbody className="divide-y divide-stone-100">
                {STORE.hours.map((h) => {
                  const isToday = h.day === today;
                  return (
                    <tr
                      key={h.day}
                      className={isToday ? "bg-indigo-50" : ""}
                      aria-current={isToday ? "date" : undefined}
                    >
                      <td className={`py-3 font-semibold ${isToday ? "text-indigo-800" : "text-stone-700"}`}>
                        {h.day}
                        {isToday && (
                          <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                            today
                          </span>
                        )}
                      </td>
                      <td
                        className={`py-3 text-right tabular-nums ${isToday ? "text-indigo-800 font-semibold" : "text-stone-600"}`}
                      >
                        {h.open}–{h.close}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">On-site amenities</h2>
            <p className="text-stone-600 text-sm mt-1">
              Everything you&apos;d expect from a neighborhood shop.
            </p>
            <ul className="mt-5 space-y-2.5">
              {STORE.amenities.map((a) => (
                <li key={a} className="flex items-start gap-2.5 text-sm text-stone-700">
                  <span className="text-indigo-600 shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {a}
                </li>
              ))}
            </ul>

            <div className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-700">Getting here</p>
              <ul className="space-y-1.5 text-sm text-stone-700">
                {PARKING_NEARBY.map((p) => (
                  <li key={p}>· {p}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What to bring */}
      <section className="bg-stone-50 border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">First time?</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              What to bring
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHAT_TO_BRING.map((b) => (
              <div key={b.label} className="rounded-2xl border border-stone-200 bg-white p-5 space-y-2">
                <div className="text-2xl" aria-hidden="true">{b.emoji}</div>
                <h3 className="font-bold text-stone-900 text-sm">{b.label}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{b.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map embed + nearby */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Find us</h2>
            <p className="text-stone-600 text-sm mt-1">{STORE.address.full}</p>
            <div className="mt-5 rounded-2xl border border-stone-200 overflow-hidden aspect-[16/10] bg-stone-100">
              <iframe
                title={`Map of ${STORE.name}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(STORE.address.full)}&output=embed`}
                width="100%"
                height="100%"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0 }}
              />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Nearby</h2>
            <p className="text-stone-600 text-sm mt-1">For when you&apos;re making a trip of it.</p>
            <ul className="mt-5 divide-y divide-stone-100 border-y border-stone-100">
              {NEARBY.map((n) => (
                <li key={n.name} className="py-3 flex items-start justify-between gap-3 text-sm">
                  <span className="text-stone-700 font-medium">{n.name}</span>
                  <span className="text-stone-500 shrink-0">{n.direction}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-stone-500 leading-relaxed mt-5">
              On Rainier Ave S in the heart of {STORE.neighborhood}, walking distance from Othello Light Rail.
              Easy stop off I-5 via Columbia City or by the 1 Line southbound.
            </p>
          </div>
        </div>
      </section>

      {/* Internal-link mesh — quick pivot to highest-converting next
          surfaces. Helps PageRank flow + customer intent. */}
      <section className="bg-stone-50 border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="text-center mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">Before you stop in</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              Plan your trip
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href={withAttr("/deals", "deal", "visit-mesh")}
              className="group rounded-2xl border border-stone-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <div className="text-2xl mb-2" aria-hidden="true">🏷️</div>
              <h3 className="font-bold text-stone-900 text-sm">Live deals today</h3>
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                Brand-day pricing, % off categories, weekly recurring specials.
              </p>
              <span className="text-indigo-700 group-hover:text-indigo-600 text-xs font-bold mt-3 inline-flex items-center gap-1">
                See what&apos;s on
                <span aria-hidden="true">→</span>
              </span>
            </Link>
            <Link
              href={withAttr("/heroes", "header", "visit-mesh-heroes")}
              className="group rounded-2xl border border-stone-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <div className="text-2xl mb-2" aria-hidden="true">🎖️</div>
              <h3 className="font-bold text-stone-900 text-sm">Heroes 30% off</h3>
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                Active military, veterans, first responders, healthcare, K-12 teachers.
              </p>
              <span className="text-indigo-700 group-hover:text-indigo-600 text-xs font-bold mt-3 inline-flex items-center gap-1">
                Check eligibility
                <span aria-hidden="true">→</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA — same gradient bookend as the hero. Page bookends in
          matching depth, just like the homepage. */}
      <section className="bg-gradient-to-br from-indigo-950 via-violet-950 to-indigo-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-extrabold">See you soon.</h2>
            <p className="text-indigo-300/70 text-sm mt-1">
              Order ahead and skip the line, or just walk in. Either way — bring cash + ID.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href={withAttr("/menu", "menu", "visit-bottom-browse")}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-300 hover:bg-indigo-200 text-indigo-950 font-bold text-sm transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950"
            >
              Browse Menu
            </Link>
            <Link
              href={withAttr("/menu", "menu", "visit-bottom-order")}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              Order Ahead
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
