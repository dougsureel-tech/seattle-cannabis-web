import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { STORE, isOpenNow, nextOpenLabel } from "@/lib/store";
import { withAttr } from "@/lib/attribution";
import { getActiveBrands, getActiveDeals, getFeaturedProducts, getJustInProducts } from "@/lib/db";
import { fetchClosureStatus } from "@/lib/closure-status";
import { ClosureBanner } from "@/components/ClosureBanner";
import { VendorAdSlot } from "@/components/VendorAdSlot";
import { PrimaryCTA } from "@/components/PrimaryCTA";
import { SectionHeading } from "@/components/SectionHeading";
import { ReviewsSection } from "@/components/Reviews";
import { LoyaltyArc } from "@/components/LoyaltyArc";
import { RecentlyViewedAutoStrip } from "@/components/RecentlyViewedAutoStrip";
import { HeroBackground } from "@/components/HeroBackground";
import { NeighborhoodMap } from "@/components/NeighborhoodMap";
import { NEIGHBORHOODS } from "@/lib/neighborhoods";

// ISR: home page hits Neon 3x per request (getActiveBrands, getFeaturedProducts,
// getActiveDeals). Was force-dynamic so every visit ran all three. 60s
// revalidate keeps the "Today's Picks" + "Today's deals" + brands grid fresh
// while the headline cache-hit ratio jumps into the high 90s. Live status
// pill is rendered client-side in <SiteHeader> + the hero re-derives from
// `isOpenNow()` at request time on each rebuild so the "Open Now" indicator
// stays accurate within ~60s — well under the granularity customers care
// about for "is it open?" pre-walk-in.
export const revalidate = 60;

// Geo SEO meta — used by paid display + CRM ad networks (Meta/Google Ads/
// Klaviyo) to anchor location-targeted creative. ICBM + geo.position duplicate
// each other on purpose; different crawlers prefer different conventions.
const NEIGHBORHOOD_NAMES = NEIGHBORHOODS.map((n) => n.name).join(", ");

export const metadata: Metadata = {
  // Homepage-specific title — distinct from /menu so / earns brand-search
  // landing and /menu shows up as a sitelink underneath. Founded year +
  // neighborhood anchor signals "this is the canonical entity page."
  title: `${STORE.name} | Cannabis Dispensary in ${STORE.neighborhood}, Seattle — Founded 2010`,
  description: `${STORE.name} at ${STORE.address.full}. Closest shop to ${NEIGHBORHOOD_NAMES}. Five min from Othello Light Rail. Founded 2010, in Rainier Valley since 2018. Open daily 8 AM–11 PM. Cash only, 21+.`,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: STORE.website,
    siteName: STORE.name,
    title: `${STORE.name} | Cannabis Dispensary in ${STORE.neighborhood}, Seattle — Founded 2010`,
    description: `${STORE.neighborhood} cannabis dispensary. Closest shop to ${NEIGHBORHOOD_NAMES}. ${STORE.address.full}.`,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${STORE.name} — ${STORE.neighborhood}, Seattle Cannabis Dispensary`,
      },
    ],
  },
  other: {
    "geo.region": "US-WA",
    "geo.placename": "Seattle, Rainier Valley",
    "geo.position": `${STORE.geo.lat};${STORE.geo.lng}`,
    ICBM: `${STORE.geo.lat}, ${STORE.geo.lng}`,
  },
};

// Each category gets a base gradient + a matching `glow` shadow class so the
// hover state lights up in the card's own color identity instead of a generic
// gray shadow. Keeping `color` and `glow` paired here so a future "add a new
// category" change is one row, not two scattered places.
const CATEGORIES = [
  {
    icon: "🌿",
    label: "Flower",
    desc: "Indoor, outdoor & greenhouse",
    href: "/menu",
    color: "from-green-600 to-emerald-800",
    glow: "hover:shadow-emerald-700/40",
  },
  {
    icon: "🍬",
    label: "Edibles",
    desc: "Gummies, chocolates & more",
    href: "/menu",
    color: "from-pink-400 to-rose-600",
    glow: "hover:shadow-rose-600/40",
  },
  {
    icon: "💨",
    label: "Vapes",
    desc: "Carts & all-in-ones",
    href: "/menu",
    color: "from-indigo-500 to-blue-800",
    glow: "hover:shadow-blue-700/40",
  },
  {
    icon: "💎",
    label: "Concentrates",
    desc: "Wax, live resin & rosin",
    href: "/menu",
    color: "from-amber-400 to-orange-600",
    glow: "hover:shadow-orange-600/40",
  },
  {
    icon: "🫙",
    label: "Pre-Rolls",
    desc: "Singles & multi-packs",
    href: "/menu",
    color: "from-orange-500 to-red-700",
    glow: "hover:shadow-red-700/40",
  },
  {
    icon: "🧪",
    label: "Tinctures",
    desc: "Measured drops & capsules",
    href: "/menu",
    color: "from-indigo-500 to-violet-700",
    glow: "hover:shadow-violet-700/40",
  },
];

const STATS = [
  { val: "Open Daily", label: "8 AM – 11 PM" },
  { val: "Free Parking", label: "On-site lot" },
  { val: "16+ yrs", label: "Rainier Valley's longest-running" },
  { val: "15% Off", label: "Online orders" },
];

export default async function HomePage() {
  const [brands, featured, justIn, deals, closure] = await Promise.all([
    getActiveBrands().catch(() => []),
    getFeaturedProducts(8).catch(() => []),
    getJustInProducts(12).catch(() => []),
    getActiveDeals().catch(() => []),
    fetchClosureStatus(),
  ]);
  // "Top Brands" carousel renders logo'd brands only. Pre-fix the section
  // was alphabetical-by-vendor-name, surfacing license-shaped junk like
  // "1555 Industrial L..." and "AG GROW - 4125..." (raw WSLCB-licensee names)
  // each rendered as a single-letter initial placeholder — visually a wall
  // of "A" / "B" cards with no logos, which is the opposite of "Washington's
  // finest producers." The existing initials fallback stays for any single
  // brand on /brands/[slug] that's logo-less, but the homepage carousel is a
  // curated brand showcase: no logo → no slot. `featuredBrands.length > 0`
  // gate below hides the whole section when the filter returns empty.
  const featuredBrands = brands
    .filter((b) => b.logoUrl != null && b.logoUrl.trim().length > 0)
    .slice(0, 10);
  // `open` flips false whenever an emergency closure is active so all
  // "Open Now / Closed" indicators on the page read consistently. The
  // static configured-hours check alone would still say "open" today even
  // after a manager flipped the override — customer would drive to a
  // closed store. ClosureBanner above the hero gives the reason inline.
  const open = isOpenNow() && !closure.isClosed;
  const statusLabel = nextOpenLabel();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: "America/Los_Angeles" });
  const todayHours = STORE.hours.find((h) => h.day === today);

  return (
    <>
      {closure.isClosed && (
        <div className="bg-amber-50 border-b-2 border-amber-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <ClosureBanner closure={closure} />
          </div>
        </div>
      )}
      {/* Vendor / house ad slot — top of page (above hero) */}
      <section className="bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <VendorAdSlot slot="homepage_top" />
        </div>
      </section>
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      {/* bg-gradient on the section is the static fallback that paints
          identically to HeroBackground's Layer 1; the component then renders
          the full multi-layer animated composition over it. */}
      <section className="relative bg-gradient-to-br from-indigo-950 via-violet-950 to-indigo-950 text-white overflow-hidden">
        <HeroBackground />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10 sm:py-14 lg:py-20">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-10">
            {/* Left: content */}
            <div className="flex-1 space-y-7">
              <div className="flex items-center gap-3 flex-wrap">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
                    open
                      ? "bg-green-400/15 border-green-400/30 text-green-300"
                      : "bg-red-400/15 border-red-400/30 text-red-300"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${open ? "bg-green-400 shadow-[0_0_6px_#4ade80] animate-pulse" : "bg-red-400"}`}
                  />
                  {open ? "Open Now" : "Closed"}
                  {todayHours && (
                    <span className="opacity-70 font-normal">
                      · {todayHours.open}–{todayHours.close}
                    </span>
                  )}
                </div>
                {/* Pickup ETA pill — concrete time expectation next to the
                    Open-Now indicator. ~5 min covers online order → arrive
                    → cash → out the door during open hours; goes quiet
                    when the store is closed. */}
                {open && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-300/15 border border-amber-300/30 text-amber-200">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                    ~5 min pickup
                  </span>
                )}
                <span className="text-indigo-400/60 text-xs font-medium uppercase tracking-widest">
                  Rainier Valley, Seattle
                </span>
              </div>

              <div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
                  Rainier Valley&apos;s
                  <br />
                  {/* "Favorite" — gradient text indigo→fuchsia→indigo with a
                      slow gradient drift (animate-gradient, 8s loop) so the
                      hero focal point reads as alive instead of static.
                      Brand-coherent — indigo-anchored on both ends. Customer-
                      voice superlative per docs/brand-voice.md (ban on
                      "premier" / "one of the best" — use "the best" or "our
                      favorite" instead). Mirror of greenlife-web hero. */}
                  <span className="animate-gradient bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
                    Favorite
                  </span>{" "}
                  <span className="text-white/90">Cannabis</span>
                  <br />
                  <span className="text-indigo-100/70 font-light">Shop.</span>
                </h1>
                <p className="text-indigo-100/60 text-lg sm:text-xl leading-relaxed max-w-lg mt-5">
                  Rainier Valley to Seward Park to Alki — pull up, pick what fits the day. Open since 2010, WA
                  brands deep, real budtenders, no rush.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <PrimaryCTA href={withAttr("/menu", "home", "hero-browse")} variant="light">
                  Browse Menu
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </PrimaryCTA>
                <PrimaryCTA href={withAttr(STORE.shopUrl, "home", "hero-order")} variant="secondary">
                  Order Online — 15% Off
                </PrimaryCTA>
              </div>

              <div className="flex items-center gap-5 text-xs text-indigo-400/55 font-medium pt-1 flex-wrap">
                {["Cash only", "21+ with valid ID", "Free parking"].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.285 6.709a1 1 0 00-1.414-1.418l-9.286 9.286-3.856-3.856a1 1 0 00-1.414 1.414l4.563 4.563a1 1 0 001.414 0l9.993-9.989z" />
                    </svg>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: store info card (desktop only). Roughly 2× the visual
                weight of the previous version — now an honest-to-god hero
                card, not an aside. New blocks added in 2026-05-02 hero
                refresh: live open/closes-at status, "closest shop to"
                neighborhood pill cluster, transit pill (Othello Link),
                and the existing chips kept for parity. */}
            <div className="hidden lg:block shrink-0">
              <div
                className="rounded-3xl border border-white/15 p-7 w-[360px] space-y-5"
                style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(14px)" }}
              >
                {/* Status block — live "Open · Closes 11 PM" up top. Bigger
                    than the previous version because this is the primary
                    "should I bother right now?" answer. */}
                <div className="flex items-center gap-3">
                  <span
                    className={`w-3.5 h-3.5 rounded-full shrink-0 ${open ? "bg-green-400 shadow-[0_0_10px_#4ade80] animate-pulse" : "bg-red-400"}`}
                  />
                  <div>
                    <div className="text-white font-extrabold text-base leading-tight">
                      {open ? "Open Now" : "Closed"}
                      {statusLabel && (
                        <span className="text-indigo-200/80 font-semibold">
                          {" · "}
                          {statusLabel}
                        </span>
                      )}
                    </div>
                    {todayHours && (
                      <div className="text-indigo-300/70 text-xs mt-0.5">
                        Today {todayHours.open} – {todayHours.close} · 365 days a year
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-px bg-white/10" />

                {/* Address + transit pill row. Address gets the bigger
                    treatment; the Othello Link pill sits beside it as the
                    "and here's how you actually get here" answer. */}
                <div>
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 mt-0.5 text-fuchsia-300 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <div>
                      <div className="text-white text-base font-bold leading-tight">
                        {STORE.address.street}
                      </div>
                      <div className="text-white/50 text-xs mt-0.5">
                        {STORE.address.city}, WA {STORE.address.zip}
                      </div>
                    </div>
                  </div>
                  {/* Transit pill — the Link Light Rail walk. Spelled out
                      because "Othello Station" isn't obvious branding to a
                      visitor who's not already South Seattle. */}
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-300/10 border border-amber-300/30 text-amber-200 text-[11px] font-bold">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <rect x="6" y="3" width="12" height="14" rx="2" />
                      <path strokeLinecap="round" d="M9 21l1-3m4 3l-1-3M9 8h6" />
                    </svg>
                    5 min walk from Othello Light Rail
                  </div>
                </div>

                <div className="h-px bg-white/10" />

                {/* Closest-shop neighborhood pills — Doug's headline ask.
                    Tight cluster, not a marketing wall. Each pill is the
                    name only, no extra text — visual rhythm beats density. */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-300/80 mb-2">
                    Closest shop to
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Rainier Valley",
                      "Seward Park",
                      "Columbia City",
                      "Beacon Hill",
                      "Mount Baker",
                      "Othello",
                      "Hillman City",
                      "Rainier Beach",
                    ].map((n) => (
                      <span
                        key={n}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-white/8 border border-white/15 text-white/85 font-semibold"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-white/10" />

                {/* Existing amenity chips kept. */}
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-3">
                  {[
                    { icon: "🅿️", text: "Free Parking" },
                    { icon: "💵", text: "Cash Only" },
                    { icon: "🏧", text: "ATM On-Site" },
                    { icon: "📅", text: "Since 2010" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-white/65 text-xs">
                      <span className="text-base leading-none">{icon}</span>
                      {text}
                    </div>
                  ))}
                </div>

                <a
                  href={STORE.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-sm font-bold transition-all"
                >
                  Get Directions ↗
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-stone-50 to-transparent" />
      </section>

      {/* ─── Stats strip ────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-stone-100">
            {STATS.map(({ val, label }) => (
              <div key={val} className="py-5 px-4 sm:px-6 text-center">
                {/* Gradient text indigo→violet on the bold value gives the
                    strip a richer feel than flat indigo-900 — depth without
                    competing with the deep-indigo hero above. */}
                <div className="text-sm sm:text-base font-extrabold leading-tight bg-gradient-to-r from-indigo-900 to-violet-800 bg-clip-text text-transparent">
                  {val}
                </div>
                <div className="text-xs text-stone-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Brands strip — sits between stats and neighborhood map so the
            rhythm is: proof (stats) → who we carry (brands) → where you are
            (neighborhood). Compact heading + logo grid with initials fallback
            for brands that haven't uploaded a logo yet. */}
      {featuredBrands.length > 0 && (
        <section className="bg-white border-b border-stone-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 mb-1">
                Washington&apos;s finest producers
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                Top Brands
              </h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-3">
              {featuredBrands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  className="group flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-stone-100 bg-stone-50 hover:border-violet-300 hover:bg-white hover:shadow-md hover:shadow-violet-500/10 hover:-translate-y-0.5 transition-all duration-200 aspect-square"
                >
                  {brand.logoUrl ? (
                    <Image
                      src={brand.logoUrl}
                      alt={brand.name}
                      width={80}
                      height={40}
                      className="max-h-10 max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                      unoptimized
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 border border-indigo-200/60 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                      <span className="text-base font-extrabold text-indigo-700 leading-none">
                        {brand.name.trim().charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-[10px] text-stone-400 group-hover:text-indigo-600 transition-colors text-center leading-tight font-medium truncate w-full text-center">
                    {brand.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Neighborhood map — South Seattle anchor. Eight neighborhoods
            (Rainier Valley, Seward Park, Columbia City, Beacon Hill, Mt
            Baker, Othello, Hillman City, Rainier Beach) plus the shop pin
            on a stylized SVG. Tap a pin → drive/walk/transit time + the
            neighborhood's deal-of-the-day + Get-directions deep-link.
            Mobile degrades to a stacked card list. See
            components/NeighborhoodMap.tsx for the analytics + retargeting
            seam (data-neighborhood + localStorage.sc_last_neighborhood). */}
      <NeighborhoodMap
        destinationAddress={STORE.address.full}
        fallbackDealShort={deals[0]?.short ?? null}
      />

      {/* ─── Recently-viewed auto-strip — returning visitors get a fast-lane
            back to products they were looking at. Hidden when empty (no
            localStorage history) so it doesn't take page real-estate from
            first-timers. Indigo accent matches the Seattle theme. */}
      <RecentlyViewedAutoStrip accent="indigo" />

      {/* ─── Why Customers Love Us — value-prop card grid mirroring the
            Wenatchee pattern, with Seattle-specific differentiators. Sits
            after the neighborhood map (geo) and before the first-time flow
            (operational) so the rhythm is: where → why → how → what's on
            today. Indigo/violet palette matches the rest of the Seattle
            site. Locally owned framing stays here per the SCC positioning
            (Wenatchee uses best-staff framing instead, separate decision). */}
      <section className="bg-stone-50 border-b border-stone-100" aria-labelledby="why-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
              Why customers love us
            </p>
            <h2
              id="why-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight mt-2"
            >
              Rainier Valley&apos;s neighborhood shop.
            </h2>
            <p className="text-stone-600 mt-3 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Sixteen years in cannabis. Eight in Rainier Valley. Same locally owned, independent
              operation that opened in 2010 — now five minutes from Othello Light Rail.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[
              {
                title: "Locally Owned · 16+ Years",
                body: "Founded 2010. In Rainier Valley since 2018. Independent — not a chain, not corporate.",
                iconPath: "M3 21V10l9-7 9 7v11h-6v-7H9v7H3z",
              },
              {
                title: "Knowledgeable Budtenders",
                body: "Trained on terps, tolerance, effect — real answers to real questions, no commission script.",
                iconPath:
                  "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
              },
              {
                title: "Curated Catalog",
                body: "We test before we stock. Drop what doesn&apos;t meet our standard. Quality over shelf count.",
                iconPath: "M5 3v18l7-3 7 3V3H5zm9 9l-2 2-2-2 2-2 2 2z",
              },
              {
                title: "Supporting Local Heroes · 30%",
                body: "Active military, veterans, first responders, healthcare, K-12 teachers. Show ID at the register.",
                iconPath:
                  "M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4zm-1 14l-4-4 1.4-1.4L11 13.2l4.6-4.6L17 10l-6 6z",
                href: "/heroes",
              },
              {
                title: "15% Off Online Orders",
                body: "Order ahead, save automatically, walk in and walk out. Pickup window stays warm in the bag.",
                iconPath:
                  "M7 4V2h10v2h5v2h-2v15a2 2 0 01-2 2H6a2 2 0 01-2-2V6H2V4h5zm2 4v11h2V8H9zm4 0v11h2V8h-2z",
              },
              {
                title: "5 Min from Othello Light Rail",
                body: "Walking distance from the station. Free parking on-site too. Either way you&apos;re in and out fast.",
                iconPath:
                  "M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3z",
              },
            ].map((card) => {
              const { title, body, iconPath } = card;
              const href = "href" in card ? (card as { href: string }).href : undefined;
              const cardInner = (
                <>
                  <div className="shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6"
                        aria-hidden="true"
                      >
                        <path d={iconPath} />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-tight">
                      {title}
                    </h3>
                    <p
                      className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: body }}
                    />
                    {href && (
                      <span className="text-xs font-semibold text-indigo-700 mt-2 inline-block">
                        Learn more →
                      </span>
                    )}
                  </div>
                </>
              );
              const className =
                "bg-white rounded-2xl border border-stone-200 hover:border-indigo-300 hover:shadow-md transition-all p-5 sm:p-6 flex gap-4 sm:gap-5";
              return href ? (
                <Link key={title} href={href} className={className}>
                  {cardInner}
                </Link>
              ) : (
                <div key={title} className={className}>
                  {cardInner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── First-time 4-tap flow — sits between stats and deals so a new
            visitor sees the literal "what do I do?" answer before the
            marketing-heavy sections. Numbered tiles with the same shape as
            the greenlife version, indigo theming. */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="text-center mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">First time?</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              4 taps, you&apos;re out the door.
            </h2>
            <p className="text-stone-600 mt-1.5 text-sm">
              No judgment. Same flow whether it&apos;s your first time or your fiftieth.
            </p>
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-3" aria-label="How to order">
            {[
              {
                emoji: "🌿",
                step: "Browse",
                detail: "Tap the menu, see live inventory + prices",
                href: "/menu",
              },
              {
                emoji: "📲",
                step: "Order ahead",
                detail: "Pick your products, choose pickup time",
                href: "/menu",
              },
              {
                emoji: "🪪",
                step: "Walk in",
                detail: "Bring cash + valid ID. Counter has it ready",
                href: null,
              },
              {
                emoji: "🚪",
                step: "Out in 5",
                detail: "Pay cash, grab the bag, you're done",
                href: null,
              },
            ].map((s, i) => {
              const inner = (
                <div className="relative h-full rounded-2xl border border-stone-200 bg-stone-50 group-hover:border-indigo-300 group-hover:bg-white transition-all p-4 sm:p-5">
                  <span className="absolute -top-2.5 left-4 text-[10px] font-bold uppercase tracking-widest text-white bg-indigo-700 px-2 py-0.5 rounded-full">
                    Step {i + 1}
                  </span>
                  <div className="flex items-start gap-3 sm:flex-col sm:gap-2">
                    <span className="text-2xl shrink-0" aria-hidden="true">
                      {s.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-stone-900 text-sm">{s.step}</p>
                      <p className="text-xs text-stone-600 leading-snug mt-0.5">{s.detail}</p>
                    </div>
                  </div>
                </div>
              );
              return (
                <li key={s.step} className="group">
                  {s.href ? (
                    <Link href={s.href} className="block h-full">
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ─── Active deals strip — only renders when something's actually
            running. Surfaces savings before the category grid so a customer
            sees "20% off Flower today" alongside "what's good?", instead
            of needing to dig into /deals. */}
      {deals.length > 0 && (
        <section className="bg-gradient-to-b from-amber-50/70 via-white to-white border-b border-stone-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
            <div className="flex items-end justify-between gap-3 mb-5 flex-wrap">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Live now</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1.5">
                  Today&apos;s deals
                </h2>
                <p className="text-stone-600 mt-1 text-sm">
                  Stackable with your loyalty points at the counter — 100 pts = $1 off — cash savings on the
                  way out.
                </p>
              </div>
              <Link
                href="/deals"
                className="text-sm font-semibold text-indigo-700 hover:text-indigo-600 transition-colors whitespace-nowrap"
              >
                All deals →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {deals.slice(0, 3).map((d) => {
                const ends = d.endDate
                  ? (() => {
                      const date = new Date(`${d.endDate}T12:00:00`);
                      const days = Math.ceil((date.getTime() - Date.now()) / 86400000);
                      if (days <= 0) return { label: "Ends today", urgent: true };
                      if (days === 1) return { label: "Ends tomorrow", urgent: true };
                      if (days <= 7)
                        return {
                          label: `Ends ${date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`,
                          urgent: false,
                        };
                      return { label: "Ongoing", urgent: false };
                    })()
                  : { label: "Ongoing", urgent: false };
                return (
                  <Link
                    key={d.id}
                    href="/deals"
                    className="group flex flex-col rounded-2xl border border-amber-200 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-amber-300 transition-all"
                  >
                    <span className="inline-flex items-center self-start gap-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wide px-2.5 py-1">
                      <span aria-hidden="true">🎟️</span> {d.short}
                    </span>
                    <h3 className="font-bold text-stone-900 text-base mt-3 group-hover:text-indigo-800 transition-colors">
                      {d.name}
                    </h3>
                    {d.description && (
                      <p className="text-sm text-stone-600 mt-1 leading-snug line-clamp-2 flex-1">
                        {d.description}
                      </p>
                    )}
                    <p
                      className={`text-xs font-medium mt-3 ${ends.urgent ? "text-rose-700" : "text-stone-500"}`}
                    >
                      {ends.label}
                    </p>
                  </Link>
                );
              })}
            </div>
            {deals.length > 3 && (
              <p className="text-xs text-stone-500 mt-4 text-center">
                +{deals.length - 3} more on the deals page
              </p>
            )}
          </div>
        </section>
      )}

      {/* ─── Category grid ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <SectionHeading
          className="mb-10"
          kicker="Premium products from the Pacific Northwest's top producers"
        >
          What We Carry
        </SectionHeading>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES.map(({ icon, label, desc, href, color, glow }) => (
            <Link
              key={label}
              href={href}
              // Each card lights up in its own color identity on hover —
              // shadow-2xl size + per-card glow color (Flower=emerald,
              // Edibles=rose, etc.) instead of a generic gray shadow.
              className={`group relative flex flex-col gap-3 p-5 rounded-2xl bg-gradient-to-br ${color} hover:scale-[1.03] hover:shadow-2xl ${glow} transition-all duration-200 overflow-hidden`}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/10" />
              <span className="text-3xl relative" aria-hidden="true">{icon}</span>
              <div className="relative">
                <div className="font-bold text-white text-sm">{label}</div>
                <div className="text-white/65 text-xs mt-0.5 leading-tight">{desc}</div>
              </div>
              <svg
                className="absolute bottom-3.5 right-3.5 w-4 h-4 text-white/25 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all duration-200"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Where you headed? — pick-the-trip vibe section. Seward Park is
              literally next door (Lake Washington swim spot, ~5 min walk).
              Alki is the westside sunset cruise. Discovery / Hurricane / Tiger
              are the trail moves. Rainier weekend is the longer haul. Sunset
              over water gradient + soft horizon SVG. Always-on for now. */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-amber-50/60 to-rose-50 border-y border-stone-100">
        <svg
          className="absolute inset-x-0 bottom-0 w-full h-24 sm:h-32 text-sky-100/60 pointer-events-none"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M0 80 C 200 40, 400 100, 600 70 C 800 40, 1000 90, 1200 60 L1200 120 L0 120 Z" />
        </svg>
        <svg
          className="absolute inset-x-0 top-12 w-full h-16 text-stone-200/50 pointer-events-none"
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M0 40 L150 10 L260 25 L380 5 L520 30 L660 12 L820 35 L960 15 L1080 28 L1200 18 L1200 60 L0 60 Z" />
        </svg>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <SectionHeading
            className="mb-10 sm:mb-12"
            eyebrow={
              <>
                <span className="text-sm">☀️</span> Where you headed?
              </>
            }
            eyebrowClassName="text-amber-700/80"
            kicker={
              <>
                Five minutes off Rainier — pull up, grab what fits the day, walk back out. Seward
                Park&apos;s right around the corner; the rest of the city&apos;s a short drive.
              </>
            }
          >
            Pick the move. We&apos;ll cover the rest.
          </SectionHeading>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                emoji: "🌊",
                label: "Seward & the lake",
                pitch: "Pre-rolls — five-min walk to the water, no grinder needed",
                href: "/menu",
                ring: "ring-sky-200/80 hover:ring-sky-400",
                accent: "text-sky-700",
              },
              {
                emoji: "🌅",
                label: "Alki cruise",
                pitch: "Edibles & drinks — drive west, sunset over the sound, easy",
                href: "/menu",
                ring: "ring-amber-200/80 hover:ring-amber-400",
                accent: "text-amber-700",
              },
              {
                emoji: "🥾",
                label: "Trail day",
                pitch: "Vapes & carts — Discovery, Tiger, Hurricane Ridge, pocket-sized",
                href: "/menu",
                ring: "ring-emerald-200/80 hover:ring-emerald-400",
                accent: "text-emerald-700",
              },
              {
                emoji: "🏔",
                label: "Rainier weekend",
                pitch: "Sealed flower — long drive, longer view, stays fresh",
                href: "/menu",
                ring: "ring-indigo-200/80 hover:ring-indigo-400",
                accent: "text-indigo-700",
              },
            ].map((v) => (
              <Link
                key={v.label}
                href={v.href}
                className={`group flex flex-col rounded-2xl bg-white/85 backdrop-blur-sm p-5 sm:p-6 ring-1 ${v.ring} shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}
              >
                <span className="text-3xl mb-3" aria-hidden="true">
                  {v.emoji}
                </span>
                <div className={`text-[11px] font-bold uppercase tracking-widest ${v.accent}`}>{v.label}</div>
                <p className="text-sm text-stone-700 leading-snug mt-1.5 flex-1">{v.pitch}</p>
                <span className="text-xs text-stone-500 group-hover:text-stone-800 mt-3 transition-colors">
                  Browse menu →
                </span>
              </Link>
            ))}
          </div>

          <p className="text-center text-xs text-stone-500 mt-8 sm:mt-10">
            21+ with the ID · cash at the counter · keep it sealed in the ride · drive sober, every time
          </p>
        </div>
      </section>

      {/* ─── How Pickup Works ───────────────────────────────────────────────── */}
      <section className="bg-stone-50 border-y border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <SectionHeading className="mb-10" kicker="Order online, skip the wait, save 15%">
            How Pickup Works
          </SectionHeading>
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="hidden sm:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-0.5 bg-indigo-100" />
            {[
              {
                icon: "📱",
                step: "1",
                title: "Browse & Order",
                body: "Shop our full menu online and place a pickup order — 15% off automatically applied.",
              },
              {
                icon: "✅",
                step: "2",
                title: "We Prepare It",
                body: "Our team gets your order ready. You'll see the status update in your account.",
              },
              {
                icon: "💵",
                step: "3",
                title: "Pay Cash & Go",
                body: "Head to the counter, pay cash, and you're out the door. Fast and easy.",
              },
            ].map(({ icon, step, title, body }) => (
              <div key={step} className="flex flex-col items-center text-center gap-3 relative">
                <div className="w-20 h-20 rounded-3xl bg-white border-2 border-indigo-100 flex items-center justify-center text-3xl shadow-sm z-10">
                  {icon}
                </div>
                <div className="space-y-1">
                  {/* Step label — gradient indigo→violet for richer accent
                      than the previous flat indigo-400. */}
                  <div className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                    Step {step}
                  </div>
                  <div className="font-bold text-stone-900 text-base">{title}</div>
                  <p className="text-stone-500 text-sm leading-relaxed max-w-xs mx-auto">{body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <PrimaryCTA href={STORE.shopUrl}>Order Online — 15% Off →</PrimaryCTA>
          </div>
        </div>
      </section>

      {/* ─── Vendor / house ad slot — under hero ────────────────────────────── */}
      {/* Renders ads admin-curated at inventoryapp /admin/marketing/vendor-ads
          for placement_slot='homepage_under_hero'. Server-side fetch; renders
          nothing when zero active ads (graceful no-op). */}
      <section className="bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <VendorAdSlot slot="homepage_under_hero" />
        </div>
      </section>

      {/* ─── 🆕 Just In This Week ──────────────────────────────────────────── */}
      {/* Auto-derived from inventory_snapshots first_seen ≤ 7d. Mirror of
          greenlife-web v3.260. Distinct from the curated /admin/marketing/featured
          surface — that's "hot picks", this is "what's new". CTA links to /menu
          (the iHeartJane Boost embed in prod), safe distinct from /order tree dev. */}
      {justIn.length > 0 && (
        <section className="py-12 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-8 gap-4">
              <SectionHeading align="left" kicker="🆕 New this week">
                Just In
              </SectionHeading>
              <Link
                href="/menu"
                className="shrink-0 text-sm font-semibold text-indigo-700 hover:text-indigo-600 transition-colors"
              >
                Full menu →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {justIn.map((p) => (
                <Link
                  key={p.id}
                  href="/menu"
                  className="group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:border-indigo-300 hover:shadow-lg transition-all relative"
                >
                  <span className="absolute top-2 right-2 z-10 text-[10px] font-bold uppercase tracking-wider bg-indigo-700 text-white px-2 py-0.5 rounded-full shadow">
                    🆕 New
                  </span>
                  <div className="aspect-square bg-stone-100 overflow-hidden relative">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-stone-100 to-stone-200">
                        🌱
                      </div>
                    )}
                    {p.strainType && (
                      <span
                        className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-semibold ${
                          p.strainType === "Sativa"
                            ? "bg-amber-100 text-amber-700"
                            : p.strainType === "Indica"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        {p.strainType}
                      </span>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    {p.brand && (
                      <div className="text-xs text-stone-600 font-medium uppercase tracking-wide truncate">
                        {p.brand}
                      </div>
                    )}
                    <div className="font-semibold text-stone-900 text-sm leading-tight line-clamp-2">
                      {p.name}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-indigo-800">
                        {p.unitPrice != null && p.unitPrice > 0 ? (
                          `$${p.unitPrice.toFixed(2)}`
                        ) : (
                          <span className="text-stone-600 font-medium">In store</span>
                        )}
                      </span>
                      {p.thcPct != null && (
                        <span className="text-xs text-stone-600">THC {p.thcPct.toFixed(1)}%</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <PrimaryCTA href="/menu">Browse Full Menu →</PrimaryCTA>
            </div>
          </div>
        </section>
      )}

      {/* ─── Featured products ──────────────────────────────────────────────── */}
      {/* TEMPORARILY REMOVED 2026-05-04 per Doug — surfaces products that read as
          a preview of the in-dev /order tree menu. Restore (drop the `false &&`)
          when /order ships to prod. */}
      {false && featured.length > 0 && (
        <section className="py-12 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-8 gap-4">
              <SectionHeading align="left" kicker="Fresh arrivals & staff favorites">
                Today&apos;s Picks
              </SectionHeading>
              <Link
                href="/menu"
                className="shrink-0 text-sm font-semibold text-indigo-700 hover:text-indigo-600 transition-colors"
              >
                Full menu →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((p) => (
                <a
                  key={p.id}
                  href={STORE.shopUrl}
                  // Featured product card — violet-tinted glow on hover (matches
                  // the brand identity used by PrimaryCTA + footer + hero) plus
                  // a subtle lift. Lights up like the homepage actually wants
                  // you to click instead of just shifting borders.
                  className="group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/15 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="aspect-square bg-stone-100 overflow-hidden relative">
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-stone-100 to-stone-200">
                        {p.category === "Flower"
                          ? "🌿"
                          : p.category === "Edibles"
                            ? "🍬"
                            : p.category === "Vapes"
                              ? "💨"
                              : p.category === "Concentrates"
                                ? "🧴"
                                : p.category === "Pre-Rolls"
                                  ? "🫙"
                                  : "🌱"}
                      </div>
                    )}
                    {p.strainType && (
                      <span
                        className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-semibold ${
                          p.strainType === "Sativa"
                            ? "bg-amber-100 text-amber-700"
                            : p.strainType === "Indica"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        {p.strainType}
                      </span>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    {p.brand && (
                      <div className="text-xs text-stone-400 font-medium uppercase tracking-wide truncate">
                        {p.brand}
                      </div>
                    )}
                    <div className="font-semibold text-stone-900 text-sm leading-tight line-clamp-2">
                      {p.name}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-indigo-800">
                        {p.unitPrice != null && p.unitPrice > 0 ? (
                          `$${p.unitPrice.toFixed(2)}`
                        ) : (
                          <span className="text-stone-400 font-medium">In store</span>
                        )}
                      </span>
                      {p.thcPct != null && (
                        <span className="text-xs text-stone-400">THC {p.thcPct.toFixed(1)}%</span>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
            <div className="text-center mt-10">
              <PrimaryCTA href={STORE.shopUrl}>Order Online — 15% Off →</PrimaryCTA>
            </div>
          </div>
        </section>
      )}

      {/* ─── Why Seattle Cannabis Co. ───────────────────────────────────────── */}
      <section className="bg-stone-50 border-y border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <SectionHeading className="mb-10">Why Seattle Cannabis Co.?</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: "📅",
                title: "Open Since 2010",
                body: "Founded in 2010, in Rainier Valley since 2018. Same neighborhood, real staff who know the products and remember regulars — longer-tenured than every chain.",
                // Card accents bumped from flat pastel-50 to a subtle gradient
                // wash + a slightly stronger border. Icon tile gets a matching
                // gradient so the pastel tone has a focal point. Same shape
                // for all three cards.
                cardCls: "bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200/80",
                iconCls: "bg-gradient-to-br from-indigo-100 to-violet-100",
              },
              {
                icon: "🌿",
                title: "Curated Selection",
                body: "We handpick every product for quality and value. Washington-grown producers, expertly selected.",
                cardCls: "bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-200/80",
                iconCls: "bg-gradient-to-br from-purple-100 to-fuchsia-100",
              },
              {
                icon: "🚊",
                title: "Easy to Reach",
                body: "Walking distance from Othello Light Rail. Free parking in our lot. Serving Rainier Valley and all of South Seattle.",
                cardCls: "bg-gradient-to-br from-sky-50 to-cyan-50 border-sky-200/80",
                iconCls: "bg-gradient-to-br from-sky-100 to-cyan-100",
              },
            ].map(({ icon, title, body, cardCls, iconCls }) => (
              <div
                key={title}
                className={`rounded-2xl border p-6 space-y-4 ${cardCls} hover:-translate-y-0.5 hover:shadow-md transition-all`}
              >
                <div className={`w-12 h-12 rounded-2xl ${iconCls} flex items-center justify-center text-2xl shadow-sm`}>
                  {icon}
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">{title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed mt-1">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Loyalty arc — tier vocabulary that matches POS/account ─── */}
      <LoyaltyArc />

      {/* ─── Reviews + AggregateRating schema ───────────────────────────────── */}
      <ReviewsSection />

      {/* ─── Hours + Map ────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">Visit Us</h2>
              <p className="text-stone-400 text-sm mt-1">{STORE.address.full}</p>
            </div>
            <div className="rounded-2xl border border-stone-100 overflow-hidden bg-indigo-50/50">
              {/* Hours card header — gradient indigo→violet→indigo matches
                  the AnnouncementBar + footer. Same identity, three places. */}
              <div className="px-5 py-4 bg-gradient-to-r from-indigo-950 via-violet-950 to-indigo-950 text-white flex justify-between items-center">
                <span className="font-bold text-sm">Store Hours</span>
                <div
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${open ? "text-green-300" : "text-red-300"}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${open ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
                  />
                  {open ? "Open Now" : "Closed"}
                </div>
              </div>
              <div className="px-5 py-4 flex justify-between items-center border-b border-indigo-100">
                <span className="font-semibold text-indigo-900 text-sm">Every Day</span>
                <span className="font-bold text-indigo-700 text-sm">8:00 AM – 11:00 PM</span>
              </div>
              <div className="px-5 py-3 text-sm text-stone-500">
                365 days a year including holidays · Rainier Valley, Seattle
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">
                Nearby Neighborhoods
              </h3>
              <div className="flex flex-wrap gap-2">
                {STORE.nearbyNeighborhoods.map((n) => (
                  <span
                    key={n}
                    className="text-xs px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 font-medium"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={`tel:${STORE.phoneTel}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm font-semibold text-stone-700 hover:text-indigo-700 transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                {STORE.phone}
              </a>
              <a
                href={`mailto:${STORE.email}?subject=${encodeURIComponent("Question from seattlecannabis.co")}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm font-semibold text-stone-700 hover:text-indigo-700 transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Email Us
              </a>
              <a
                href={STORE.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-800 hover:bg-indigo-700 text-white text-sm font-semibold transition-all"
              >
                Get Directions ↗
              </a>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-stone-100 shadow-sm aspect-[4/3]">
            <iframe
              title="Seattle Cannabis Co location"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(STORE.address.full)}&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* Vendor / house ad slot */}
      <section className="bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <VendorAdSlot slot="homepage_under_brands" />
        </div>
      </section>

      {/* ─── CTA band ───────────────────────────────────────────────────────── */}
      {/* Bottom-of-page CTA — same indigo→violet gradient identity as the
          AnnouncementBar / footer / hours card. Page bookends in matching
          depth instead of a flat indigo slab. */}
      <section className="bg-gradient-to-br from-indigo-950 via-violet-950 to-indigo-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to order?</h2>
            <p className="text-indigo-300/80 text-sm">
              Order online and save 15% — pick up in store on Rainier Ave S.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <PrimaryCTA href={withAttr("/menu", "home", "bottom-browse")} variant="light">
              Browse Menu
            </PrimaryCTA>
            <PrimaryCTA href={withAttr(STORE.shopUrl, "home", "bottom-order")} variant="secondary">
              Order Online — 15% Off
            </PrimaryCTA>
          </div>
        </div>
      </section>
    </>
  );
}
