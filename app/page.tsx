import type { Metadata } from "next";
import Link from "next/link";
import { STORE, isOpenNow } from "@/lib/store";

export const metadata: Metadata = {
  title: `${STORE.name} | Cannabis Dispensary Seattle, WA`,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const open = isOpenNow();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayHours = STORE.hours.find((h) => h.day === today);

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
              Seattle&apos;s<br />
              <span className="text-indigo-300">Premier Cannabis</span><br />
              Dispensary
            </h1>
            <p className="text-indigo-100/80 text-lg sm:text-xl leading-relaxed">
              Premium flower, concentrates, edibles, vapes, and more. Expert budtenders ready to guide you to the perfect product.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/menu"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-base transition-colors">
                Shop Our Menu
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/20 hover:border-white/40 text-white font-medium text-base transition-colors">
                Find Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Info bar */}
      <section className="bg-indigo-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <span className="text-indigo-200">{STORE.address.full}</span>
          {STORE.phone !== "TODO — add phone" && (
            <a href={`tel:${STORE.phoneTel}`} className="text-indigo-200 hover:text-white transition-colors">{STORE.phone}</a>
          )}
          <span className="text-indigo-400 text-xs">Cash only · Must be 21+ · Valid ID required</span>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">What We Carry</h2>
          <p className="text-stone-500 mt-2">Carefully curated products from the Pacific Northwest&apos;s best producers</p>
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

      {/* Brands teaser */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-end justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-stone-900">Featured Brands</h2>
          <Link href="/brands" className="text-sm font-medium text-indigo-700 hover:text-indigo-600 transition-colors">View all →</Link>
        </div>
        <Link href="/brands"
          className="block rounded-2xl border-2 border-dashed border-stone-200 hover:border-indigo-300 bg-stone-50 hover:bg-indigo-50 transition-all py-14 text-center group">
          <p className="text-stone-400 group-hover:text-indigo-600 transition-colors font-medium">See all brands we carry →</p>
        </Link>
      </section>
    </>
  );
}
