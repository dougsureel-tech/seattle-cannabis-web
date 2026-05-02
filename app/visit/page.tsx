import type { Metadata } from "next";
import Link from "next/link";
import { STORE, isOpenNow, nextOpenLabel } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Visit — Hours, Directions, What to Bring",
  description: `Visit ${STORE.name} at ${STORE.address.full}. Hours, parking, ID requirements, and directions. ATM on-site, free parking, ADA accessible. ${STORE.phone}.`,
  alternates: { canonical: "/visit" },
  openGraph: {
    title: `Visit ${STORE.name}`,
    description: `${STORE.address.full} · ${STORE.phone} · Free parking, near Othello Light Rail.`,
    url: `${STORE.website}/visit`,
    type: "website",
    images: ["/opengraph-image"],
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

export default function VisitPage() {
  const open = isOpenNow();
  const statusLabel = nextOpenLabel();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: "America/Los_Angeles" });
  const todayHours = STORE.hours.find((h) => h.day === today);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(visitSchema) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

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
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 sm:py-20">
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
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-300 hover:bg-indigo-200 text-indigo-950 font-bold text-sm transition-all shadow-lg"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
              </svg>
              Get Directions
            </a>
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-sm transition-all"
            >
              Order Ahead
            </Link>
            <a
              href={`tel:${STORE.phoneTel}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-sm transition-all"
            >
              📞 {STORE.phone}
            </a>
          </div>
        </div>
      </section>

      {/* Hours + Amenities */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Hours</h2>
            <p className="text-stone-600 text-sm mt-1">Open every day of the year, including holidays.</p>
            <table className="mt-5 w-full text-sm">
              <tbody className="divide-y divide-stone-100">
                {STORE.hours.map((h) => {
                  const isToday = h.day === today;
                  return (
                    <tr key={h.day} className={isToday ? "bg-indigo-50" : ""}>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">First time?</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              What to bring
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHAT_TO_BRING.map((b) => (
              <div key={b.label} className="rounded-2xl border border-stone-200 bg-white p-5 space-y-2">
                <div className="text-2xl">{b.emoji}</div>
                <h3 className="font-bold text-stone-900 text-sm">{b.label}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{b.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map embed + nearby */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
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

      {/* Bottom CTA — same gradient bookend as the hero. Page bookends in
          matching depth, just like the homepage. */}
      <section className="bg-gradient-to-br from-indigo-950 via-violet-950 to-indigo-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-extrabold">See you soon.</h2>
            <p className="text-indigo-300/70 text-sm mt-1">
              Order ahead and skip the line, or just walk in. Either way — bring cash + ID.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-300 hover:bg-indigo-200 text-indigo-950 font-bold text-sm transition-all shadow-md"
            >
              Browse Menu
            </Link>
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-sm transition-all"
            >
              Order Ahead
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
