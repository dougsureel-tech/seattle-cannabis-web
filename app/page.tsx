import type { Metadata } from "next";
import Link from "next/link";
import { STORE, isOpenNow } from "@/lib/store";
import { getActiveBrands } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${STORE.name} | Cannabis Dispensary Rainier Valley, Seattle WA`,
  description: `${STORE.name} at ${STORE.address.full}. Serving ${STORE.nearbyNeighborhoods.join(", ")} and all of South Seattle. Open daily 8am–11pm.`,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const open = isOpenNow();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayHours = STORE.hours.find((h) => h.day === today);
  const brands = await getActiveBrands().catch(() => []);
  const featuredBrands = brands.filter((b) => b.logoUrl).slice(0, 10);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #818cf8, transparent 60%), radial-gradient(circle at 80% 20%, #a78bfa, transparent 50%)" }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm">
              <span className={`w-2 h-2 rounded-full ${open ? "bg-green-400" : "bg-red-400"}`} />
              <span className="font-medium">{open ? "Open Now" : "Closed"}</span>
              {todayHours && <span className="text-white/70">· Today {todayHours.open}–{todayHours.close}</span>}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Rainier Valley&apos;s<br />
              <span className="text-indigo-300">Cannabis</span><br />
              Dispensary
            </h1>
            <p className="text-indigo-100/80 text-lg sm:text-xl leading-relaxed">
              Veteran-owned and community-rooted. Serving {STORE.neighborhood} and all of South Seattle with premium cannabis and expert budtenders — open daily 8am to 11pm.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a href={STORE.shopUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-base transition-colors">
                Order Online — 15% Off
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <Link href="/menu"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/20 hover:border-white/40 text-white font-medium text-base transition-colors">
                Browse Menu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Info bar */}
      <section className="bg-indigo-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-300 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
            <a href={STORE.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-200 hover:text-white transition-colors">
              {STORE.address.full}
            </a>
          </div>
          <a href={`tel:${STORE.phoneTel}`} className="text-indigo-200 hover:text-white transition-colors">{STORE.phone}</a>
          <span className="text-indigo-400 text-xs">Cash · 21+ · Open Daily 8am–11pm</span>
        </div>
      </section>

      {/* Perks bar */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
          {STORE.perks.map((p) => (
            <span key={p} className="flex items-center gap-1.5 text-xs text-stone-500">
              <span className="text-indigo-500">✓</span> {p}
            </span>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">What We Carry</h2>
          <p className="text-stone-500 mt-2">Premium products from the Pacific Northwest&apos;s top producers</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: "🌿", label: "Flower",       desc: "Indoor, outdoor & greenhouse" },
            { icon: "🍬", label: "Edibles",      desc: "Gummies, chocolates & more" },
            { icon: "💨", label: "Vapes",        desc: "Cartridges & all-in-ones" },
            { icon: "🧴", label: "Concentrates", desc: "Live resin, wax & shatter" },
            { icon: "🫙", label: "Pre-Rolls",    desc: "Singles & multi-packs" },
            { icon: "💊", label: "Tinctures",    desc: "Oils & capsules" },
          ].map(({ icon, label, desc }) => (
            <Link key={label} href="/menu"
              className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-stone-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 transition-all text-center">
              <span className="text-3xl">{icon}</span>
              <div>
                <div className="font-semibold text-stone-800 group-hover:text-indigo-800 transition-colors text-sm">{label}</div>
                <div className="text-xs text-stone-400 mt-0.5 leading-tight">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Hours + Map */}
      <section className="bg-white border-y border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Store Hours</h2>
              <p className="text-stone-500 text-sm mt-1">{STORE.address.full}</p>
            </div>
            <div className="rounded-xl border border-stone-200 overflow-hidden">
              <div className="px-4 py-3 bg-indigo-50 flex justify-between items-center text-sm font-semibold">
                <span className="text-indigo-800">Open Daily</span>
                <span className="text-indigo-700">8:00 AM – 11:00 PM</span>
              </div>
              <div className="px-4 py-3 text-sm text-stone-500 border-t border-stone-100">365 days a year including holidays</div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">Nearby Neighborhoods</h3>
              <div className="flex flex-wrap gap-2">
                {STORE.nearbyNeighborhoods.map((n) => (
                  <span key={n} className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">{n}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={`tel:${STORE.phoneTel}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 hover:border-indigo-300 text-sm font-medium text-stone-700 hover:text-indigo-700 transition-colors">
                {STORE.phone}
              </a>
              <a href={STORE.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-800 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
                Directions ↗
              </a>
              <a href={STORE.shopUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors">
                Order Online (15% off)
              </a>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm aspect-[4/3]">
            <iframe
              title="Seattle Cannabis Co location"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(STORE.address.full)}&output=embed`}
              width="100%" height="100%"
              style={{ border: 0 }}
              allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">Featured Brands</h2>
            <p className="text-stone-500 mt-1 text-sm">We carry Washington&apos;s top producers</p>
          </div>
          <Link href="/brands" className="shrink-0 text-sm font-medium text-indigo-700 hover:text-indigo-600 transition-colors">
            View all {brands.length > 0 ? `${brands.length} ` : ""}brands →
          </Link>
        </div>
        {featuredBrands.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            {featuredBrands.map((brand) => (
              <Link key={brand.id} href={`/brands/${brand.slug}`}
                className="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-stone-200 bg-white hover:border-indigo-300 hover:shadow-sm transition-all aspect-square">
                <img src={brand.logoUrl!} alt={brand.name} className="max-h-14 max-w-full object-contain" />
                <span className="text-xs text-stone-400 group-hover:text-indigo-700 transition-colors text-center leading-tight">{brand.name}</span>
              </Link>
            ))}
            {brands.length > featuredBrands.length && (
              <Link href="/brands"
                className="flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border-2 border-dashed border-stone-200 hover:border-indigo-300 bg-stone-50 hover:bg-indigo-50 transition-all aspect-square">
                <span className="text-2xl font-bold text-stone-300">+{brands.length - featuredBrands.length}</span>
                <span className="text-xs text-stone-400">more brands</span>
              </Link>
            )}
          </div>
        ) : (
          <Link href="/brands"
            className="block rounded-2xl border-2 border-dashed border-stone-200 hover:border-indigo-300 bg-stone-50 hover:bg-indigo-50 transition-all py-14 text-center group">
            <p className="text-stone-400 group-hover:text-indigo-600 transition-colors font-medium">See all brands we carry →</p>
          </Link>
        )}
      </section>

      {/* Why us */}
      <section className="bg-indigo-950 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Why Seattle Cannabis Co.?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: "🎖️", title: "Veteran-Owned", body: "We're proud to be a veteran-owned small business. Military and veteran discounts available — just show your ID." },
              { icon: "🌿", title: "Curated Selection", body: "We handpick every product with quality and value in mind. Washington-grown producers, expertly chosen." },
              { icon: "🚊", title: "Easy to Reach", body: "Walking distance from Othello Light Rail Station. Free parking in our lot. Serving Rainier Valley and all of South Seattle." },
            ].map(({ icon, title, body }) => (
              <div key={title} className="text-center space-y-3">
                <span className="text-4xl">{icon}</span>
                <h3 className="font-semibold text-lg text-white">{title}</h3>
                <p className="text-indigo-300/80 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
