import Link from "next/link";
import { STORE } from "@/lib/store";

export function SiteFooter() {
  return (
    <footer className="bg-indigo-950 text-indigo-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-white font-bold text-lg">{STORE.name}</h2>
            <p className="text-indigo-400 text-sm mt-0.5">{STORE.tagline}</p>
          </div>
          <address className="not-italic text-sm text-indigo-300 space-y-1">
            <p>{STORE.address.street}</p>
            <p>{STORE.address.city}, {STORE.address.state} {STORE.address.zip}</p>
            <a href={`tel:${STORE.phoneTel}`} className="block hover:text-white transition-colors">{STORE.phone}</a>
            <a href={`mailto:${STORE.email}`} className="block hover:text-white transition-colors">{STORE.email}</a>
          </address>
        </div>

        <div className="space-y-3">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Hours</h3>
          <ul className="space-y-1">
            {STORE.hours.map((h) => (
              <li key={h.day} className="flex justify-between text-sm gap-4">
                <span className="text-indigo-400">{h.day.slice(0, 3)}</span>
                <span className="text-indigo-200">{h.open} – {h.close}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Explore</h3>
          <ul className="space-y-2 text-sm">
            {[
              { href: "/menu", label: "Shop Menu" },
              { href: "/brands", label: "Our Brands" },
              { href: "/faq", label: "FAQ" },
              { href: "/about", label: "About Us" },
              { href: "/contact", label: "Contact" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-indigo-300 hover:text-white transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-indigo-900 py-4 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-indigo-700">
          <p>© {new Date().getFullYear()} {STORE.name}. All rights reserved. Must be 21+ to purchase.</p>
          <p className="flex items-center gap-2">
            <span>Licensed Washington State Cannabis Retailer</span>
            {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA && (
              <span className="font-mono opacity-50">
                v{process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA.slice(0, 7)}
              </span>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
