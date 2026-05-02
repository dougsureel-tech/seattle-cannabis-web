import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${STORE.name} — Rainier Valley's veteran-owned cannabis dispensary serving South Seattle with expert staff and carefully curated products.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <div className="relative overflow-hidden bg-indigo-950 text-white py-10 sm:py-14">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(ellipse 60% 50% at 80% 50%, #818cf8, transparent)" }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">Our Story</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">About Seattle Cannabis Co.</h1>
          <p className="text-indigo-300/70 mt-2 text-sm sm:text-base">Veteran-owned · Rainier Valley&apos;s community dispensary</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12 sm:space-y-16">

        {/* Mission */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">Who We Are</h2>
            <p className="text-stone-600 leading-relaxed">
              Seattle Cannabis Co. is a veteran-owned cannabis dispensary rooted in Rainier Valley. We&apos;re proud to
              serve South Seattle&apos;s diverse community — from first-time visitors to longtime enthusiasts.
            </p>
            <p className="text-stone-600 leading-relaxed">
              Our team of knowledgeable budtenders takes time to understand what you&apos;re looking for and guide you
              toward the right product. Whether you&apos;re seeking relief, relaxation, creativity, or just exploring —
              we&apos;re here to help with no judgment.
            </p>
            <p className="text-stone-600 leading-relaxed">
              We handpick every product on our shelves, prioritizing quality, value, and Washington-grown producers.
              Open 365 days a year, 8am to 11pm — because good cannabis shouldn&apos;t have a bad schedule.
            </p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-8 space-y-6">
            {[
              { stat: "21+",    label: "Age requirement",    note: "Valid government ID required every visit" },
              { stat: "Cash",   label: "Only payment",       note: "ATM available on-site" },
              { stat: "WA",     label: "Licensed retailer",  note: `License #${STORE.wslcbLicense}` },
              { stat: "8AM",    label: "Open daily from",    note: "8:00 AM – 11:00 PM, every day" },
            ].map(({ stat, label, note }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-14 text-right shrink-0">
                  <span className="text-2xl font-extrabold text-indigo-300">{stat}</span>
                </div>
                <div className="h-8 w-px bg-indigo-700 shrink-0" />
                <div>
                  <div className="font-bold text-white text-sm">{label}</div>
                  <div className="text-indigo-300/70 text-xs">{note}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="space-y-6">
          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: "🎖️",
                title: "Veteran-Owned",
                body: "Proud to be a veteran-owned small business. We offer discounts to active duty military, veterans, and first responders — just show your ID.",
                color: "bg-indigo-50 border-indigo-200",
              },
              {
                icon: "🌿",
                title: "Quality Curation",
                body: "Every product on our shelves was chosen deliberately. We try everything before it hits the shelf and drop what doesn't meet our standard.",
                color: "bg-purple-50 border-purple-200",
              },
              {
                icon: "🏘️",
                title: "Community Rooted",
                body: "Rainier Valley is our neighborhood. We know our customers, support local causes, and carry products made by Washington producers.",
                color: "bg-blue-50 border-blue-200",
              },
            ].map(({ icon, title, body, color }) => (
              <div key={title} className={`rounded-2xl border p-6 space-y-3 ${color}`}>
                <span className="text-3xl">{icon}</span>
                <h3 className="font-bold text-stone-900">{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Amenities */}
        <section className="rounded-3xl bg-stone-50 border border-stone-100 p-8 space-y-5">
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">When You Visit</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...STORE.amenities, ...STORE.perks].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-stone-600">
                <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.285 6.709a1 1 0 00-1.414-1.418l-9.286 9.286-3.856-3.856a1 1 0 00-1.414 1.414l4.563 4.563a1 1 0 001.414 0l9.993-9.989z"/>
                </svg>
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* Neighborhoods */}
        <section className="space-y-4">
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Serving South Seattle</h2>
          <p className="text-stone-500 text-sm">We&apos;re in Rainier Valley and easy to reach from:</p>
          <div className="flex flex-wrap gap-2">
            {STORE.nearbyNeighborhoods.map((n) => (
              <span key={n} className="text-sm px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                {n}
              </span>
            ))}
          </div>
        </section>

        {/* Location */}
        <section className="space-y-5">
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Come See Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-stone-100 bg-white p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-indigo-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-stone-900">{STORE.address.street}</div>
                  <div className="text-stone-500 text-sm">{STORE.address.city}, {STORE.address.state} {STORE.address.zip}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-indigo-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <a href={`tel:${STORE.phoneTel}`} className="font-bold text-indigo-700 hover:text-indigo-600 transition-colors">{STORE.phone}</a>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-indigo-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <a href={`mailto:${STORE.email}`} className="font-bold text-indigo-700 hover:text-indigo-600 transition-colors text-sm">{STORE.email}</a>
              </div>
              <div className="pt-1 flex gap-3">
                <a href={STORE.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-indigo-800 hover:bg-indigo-700 text-white text-sm font-bold transition-colors">
                  Get Directions ↗
                </a>
                <Link href="/contact" className="px-4 py-2 rounded-xl border border-stone-200 hover:border-indigo-300 text-sm font-semibold text-stone-700 hover:text-indigo-700 transition-colors">
                  Contact Us
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-100 bg-white overflow-hidden">
              <div className="px-5 py-3 bg-indigo-950 text-white">
                <span className="font-bold text-sm">Store Hours</span>
              </div>
              {STORE.hours.map((h) => {
                const isToday = h.day === new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: "America/Los_Angeles" });
                return (
                  <div key={h.day} className={`flex justify-between px-5 py-2.5 text-sm border-b border-stone-50 ${isToday ? "bg-indigo-50" : ""}`}>
                    <span className={`font-medium ${isToday ? "text-indigo-800" : "text-stone-600"}`}>
                      {h.day}
                      {isToday && <span className="ml-2 text-xs bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded-full">Today</span>}
                    </span>
                    <span className={`tabular-nums ${isToday ? "text-indigo-700 font-bold" : "text-stone-400"}`}>{h.open} – {h.close}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="rounded-3xl bg-indigo-950 text-white p-8 text-center space-y-4">
          <p className="font-bold text-xl">Come see us in Rainier Valley</p>
          <p className="text-indigo-300/70 text-sm max-w-sm mx-auto">
            Open every day 8AM–11PM. No appointment needed. Walk-ins always welcome.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <a href={STORE.shopUrl}
              className="px-5 py-2.5 rounded-xl bg-indigo-300 hover:bg-indigo-200 text-indigo-950 text-sm font-bold transition-all shadow-md hover:-translate-y-0.5">
              Order Online — 15% Off
            </a>
            <Link href="/contact"
              className="px-5 py-2.5 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white text-sm font-semibold transition-all">
              Contact Us
            </Link>
          </div>
        </section>

      </div>
    </>
  );
}
