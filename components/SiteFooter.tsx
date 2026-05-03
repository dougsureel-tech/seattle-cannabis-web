import Link from "next/link";
import { STORE } from "@/lib/store";
import { BUILD_VERSION, BUILD_SHA } from "@/lib/version";
import { PrimaryCTA } from "./PrimaryCTA";
import { withAttr } from "@/lib/attribution";

export function SiteFooter() {
  return (
    // Footer — gradient indigo-950 base with a subtle violet wash through the
    // middle so the bottom of the page reads as depth instead of a flat slab.
    // Matches the AnnouncementBar at the top — bookends the page in the same
    // indigo→violet gradient identity.
    <footer className="bg-gradient-to-br from-indigo-950 via-violet-950 to-indigo-950 text-indigo-200">
      {/* Trust strip — thin top band of credentials. Visible-everywhere
          chrome that signals "real licensed shop" before the call to order.
          Mirrors the Wenatchee footer for cross-store consistency. */}
      <div className="border-b border-indigo-900/40 bg-indigo-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[10.5px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-300/80">
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3" aria-hidden="true">
              <path d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z" />
            </svg>
            Founded 2010
          </span>
          <span className="hidden sm:inline text-indigo-700">·</span>
          <span>WSLCB License {STORE.wslcbLicense}</span>
          <span className="hidden sm:inline text-indigo-700">·</span>
          <span>21+ Verified</span>
          <span className="hidden sm:inline text-indigo-700">·</span>
          <span>Cash Only</span>
          <span className="hidden sm:inline text-indigo-700">·</span>
          <span>ADA Accessible</span>
        </div>
      </div>

      {/* Pre-footer CTA strip — subtle gradient overlay so the strip stands
          out from the main footer body. */}
      <div className="border-b border-indigo-900/60 bg-gradient-to-r from-indigo-900/40 via-violet-900/30 to-indigo-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-white text-sm">Ready to order?</p>
            <p className="text-indigo-400/70 text-xs mt-0.5">
              Save 15% online · {STORE.neighborhood}, Seattle
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <PrimaryCTA href={withAttr(STORE.shopUrl, "footer", "order")} variant="light" size="sm">
              Order Online — 15% Off
            </PrimaryCTA>
            <PrimaryCTA href={withAttr("/menu", "footer", "browse")} variant="secondary" size="sm">
              Browse Menu
            </PrimaryCTA>
          </div>
        </div>
      </div>

      {/* Main footer grid — 5-column on lg so Brand+Contact gets two,
          and Hours/Explore/We-Serve each get one. Was 4-col with
          col-span-2 on Brand which left a half-row of dead space below
          the short brand block while Explore stretched to 16 items.
          5/2-1-1-1 + trimmed Explore (10 items) lines the row up. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
        {/* Brand + contact — 2 of 5 cols on lg */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center gap-3">
            {/* Footer SC badge — same gradient identity as the SiteHeader
                badge so the brand mark is consistent top-to-bottom. */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 flex items-center justify-center shrink-0 shadow-sm shadow-violet-900/30">
              <span className="text-white font-bold text-sm tracking-tight">SC</span>
            </div>
            <div>
              <div className="text-white font-bold text-base leading-tight">{STORE.name}</div>
              <div className="text-indigo-400/70 text-xs mt-0.5">{STORE.tagline}</div>
              <div className="text-fuchsia-300/70 text-[10px] mt-1 font-semibold uppercase tracking-[0.14em]">
                Founded 2010 · 16+ years · Rainier Valley
              </div>
            </div>
          </div>

          <address className="not-italic text-sm text-indigo-300/80 space-y-1.5">
            <p>{STORE.address.street}</p>
            <p>
              {STORE.address.city}, {STORE.address.state} {STORE.address.zip}
            </p>
            <a href={`tel:${STORE.phoneTel}`} className="block hover:text-white transition-colors">
              {STORE.phone}
            </a>
            <a href={`mailto:${STORE.email}`} className="block hover:text-white transition-colors text-xs">
              {STORE.email}
            </a>
          </address>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={STORE.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs text-indigo-300 hover:text-white transition-all"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              Get Directions
            </a>
            {STORE.social.instagram && (
              <a
                href={STORE.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs text-indigo-300 hover:text-white transition-all"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                Instagram
              </a>
            )}
            {STORE.social.facebook && (
              <a
                href={STORE.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs text-indigo-300 hover:text-white transition-all"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </a>
            )}
          </div>
        </div>

        {/* Hours — uniform every day, just say so */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold text-xs uppercase tracking-widest">Hours</h3>
          <div className="space-y-3">
            <div className="text-xs text-indigo-200/80 space-y-1">
              <div className="font-semibold text-white">Open Every Day</div>
              <div className="text-indigo-300/80">8:00 AM – 11:00 PM</div>
              <div className="text-indigo-400/60">365 days including holidays</div>
            </div>
            <div className="text-xs text-indigo-300/70 space-y-1">
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-3 h-3 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Othello Light Rail — 5 min walk
              </div>
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-3 h-3 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Free parking on-site
              </div>
            </div>
          </div>
        </div>

        {/* Explore — top-10 most-clicked routes only. Press / Accessibility /
            Contact moved to the small legal-row at the bottom of the footer
            (alongside Privacy + Terms when those land) so Explore stays a
            scan-able marketing column, not a sitemap dump. */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold text-xs uppercase tracking-widest">Explore</h3>
          <ul className="space-y-2">
            {[
              { href: "/menu", label: "Shop Menu" },
              { href: "/order", label: "Order for Pickup" },
              { href: "/deals", label: "Deals & Specials" },
              { href: "/heroes", label: "Heroes Discount" },
              { href: "/find-your-strain", label: "Find your strain" },
              { href: "/brands", label: "Our Brands" },
              { href: "/visit", label: "Visit Us" },
              { href: "/community", label: "Our Community" },
              { href: "/blog", label: "Guides" },
              { href: "/about", label: "About Us" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-xs text-indigo-300/80 hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Nearby neighborhoods — internal-link / local-SEO juice for
            "cannabis dispensary in <neighborhood>" queries. Mirror of
            greenlife-web's footer structure. */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold text-xs uppercase tracking-widest">We serve</h3>
          <ul className="space-y-2">
            {[
              "Rainier Valley",
              "Seward Park",
              "Columbia City",
              "Beacon Hill",
              "Mount Baker",
              "Othello",
              "Hillman City",
              "Rainier Beach",
            ].map((hood) => (
              <li key={hood} className="text-xs text-indigo-300/80">
                <span className="text-indigo-400/40 mr-1">·</span>
                {hood}, Seattle
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-indigo-400/40 leading-relaxed pt-1">
            5 min off I-5 via Columbia City exit. Othello Light Rail walk-up.
          </p>
        </div>
      </div>

      {/* Secondary links row — Privacy / Terms / Accessibility / Contact /
          Press / Account / FAQ / Cannabis 101. Lives below the marketing
          grid because these are reference / utility routes, not promo. */}
      <div className="border-t border-indigo-900/40 px-4 sm:px-6 py-4">
        <ul className="max-w-7xl mx-auto flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-indigo-400/70">
          {[
            { href: "/contact", label: "Contact" },
            { href: "/faq", label: "FAQ" },
            { href: "/learn", label: "Cannabis 101" },
            { href: "/account", label: "My Account" },
            { href: "/press", label: "Press" },
            { href: "/accessibility", label: "Accessibility" },
          ].map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="hover:text-white transition-colors">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* WAC 314-55-082 statutory health warning. VERBATIM from the
          Washington statute. Sits above the copyright bar — amber tint
          signals compliance copy, not marketing. Doug 2026-05-02 greenlit
          per `Green Life/PLAN_LEGAL_WARNINGS.md`. */}
      <div className="border-t border-amber-300/30 bg-amber-400/5 py-4 px-4 sm:px-6">
        <p className="max-w-7xl mx-auto text-[11px] leading-relaxed text-amber-100">
          <span className="font-extrabold uppercase tracking-widest text-amber-300">
            Warning ·
          </span>{" "}
          This product has intoxicating effects and may be habit forming. Smoking is hazardous to
          your health. There may be health risks associated with consumption of this product.
          Should not be used by women that are pregnant or breast feeding. Marijuana can impair
          concentration, coordination, and judgment. Do not operate a vehicle or machinery while
          under the influence of this drug. For use only by adults twenty-one and older. Keep out
          of the reach of children.
        </p>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-indigo-900/60 py-5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-indigo-500/70">
          <p>
            © {new Date().getFullYear()} {STORE.name}. All rights reserved. Must be 21+ to purchase.
          </p>
          <p className="flex items-center gap-3">
            <span>Licensed WA Cannabis Retailer</span>
            {STORE.wslcbLicense && <span className="font-mono">#{STORE.wslcbLicense}</span>}
          </p>
        </div>
        {/* Build identity — intentionally subtle. Doug's at-a-glance "did the
            deploy land" signal. SHA comes from Vercel; v# is hand-bumped for
            major releases. */}
        <p className="max-w-7xl mx-auto mt-2 text-[9px] font-mono tabular-nums text-indigo-500/30 text-right select-all">
          v{BUILD_VERSION} · {BUILD_SHA}
        </p>
      </div>
    </footer>
  );
}
