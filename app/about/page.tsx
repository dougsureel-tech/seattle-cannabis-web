import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${STORE.name} — Seattle's locally owned cannabis dispensary with expert staff and a carefully curated selection.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <div className="bg-indigo-950 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold">About {STORE.name}</h1>
          <p className="text-indigo-300/80 mt-1 text-sm">Seattle&apos;s locally owned cannabis dispensary</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-stone-900">Who We Are</h2>
          <p className="text-stone-600 leading-relaxed">
            Seattle Cannabis Co. is a locally owned and operated dispensary serving Seattle, Washington.
            We believe that cannabis should be approachable, educational, and enjoyable — for everyone from first-time customers to seasoned enthusiasts.
          </p>
          <p className="text-stone-600 leading-relaxed">
            Our knowledgeable budtenders take the time to understand what you&apos;re looking for and guide you toward the perfect product. Whether you&apos;re seeking relief, relaxation, creativity, or just exploring — we&apos;re here to help.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { stat: "21+", label: "Age requirement", note: "Valid government ID required" },
            { stat: "Cash", label: "Payment only", note: "ATM available on-site" },
            { stat: "WA", label: "Licensed retailer", note: "State licensed cannabis store" },
          ].map(({ stat, label, note }) => (
            <div key={label} className="rounded-xl border border-stone-200 bg-white p-5 text-center space-y-1">
              <div className="text-3xl font-bold text-indigo-700">{stat}</div>
              <div className="font-semibold text-stone-800 text-sm">{label}</div>
              <div className="text-xs text-stone-400">{note}</div>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-stone-900">Visit Us</h2>
          <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-3">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <div>
                <div className="font-medium text-stone-800">{STORE.address.street}</div>
                <div className="text-stone-500 text-sm">{STORE.address.city}, {STORE.address.state} {STORE.address.zip}</div>
              </div>
            </div>
            {STORE.phone !== "TODO — add phone" && (
              <a href={`tel:${STORE.phoneTel}`} className="text-indigo-700 hover:underline font-medium">{STORE.phone}</a>
            )}
          </div>
          <div className="flex gap-3">
            <a href={STORE.googleMapsUrl} target="_blank" rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-indigo-800 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
              Get Directions ↗
            </a>
            <Link href="/contact" className="px-4 py-2.5 rounded-xl border border-stone-200 hover:border-indigo-300 text-sm font-medium text-stone-700 hover:text-indigo-700 transition-colors">
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
