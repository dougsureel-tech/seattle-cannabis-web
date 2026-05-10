import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import { AgeGate } from "@/components/AgeGate";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileStickyCta } from "@/components/MobileStickyCta";
import { CartResumeBanner } from "@/components/CartResumeBanner";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { InstallAppBanner } from "@/components/InstallAppBanner";
import { STORE } from "@/lib/store";
import "./globals.css";
import { safeJsonLd } from "@/lib/json-ld-safe";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

// GA4 measurement ID — when Doug enables GA4 in the dashboard, paste the
// "G-XXXXXXX" measurement ID into NEXT_PUBLIC_GA_ID on Vercel and the
// gtag.js loader auto-renders site-wide. Empty = no-op (zero bytes shipped).
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(STORE.website),
  title: {
    // Brand-anchor title with founded year + neighborhood. Brand-search
    // ("Seattle Cannabis Co") should land on / not /menu, which means /
    // needs a tighter primary title than the live-menu page.
    default: `${STORE.name} | Cannabis Dispensary in ${STORE.neighborhood}, Seattle — Founded 2010`,
    template: `%s | ${STORE.name}`,
  },
  // 158 chars (within Google's 160 SERP cap). Compresses the long form
  // to brand + neighborhood + founded year + heritage + cash-only signal.
  // Sister of GW + glw v10.105 length sweep. v11.005.
  description: `${STORE.name} — ${STORE.neighborhood} cannabis dispensary since 2010, rooted in Rainier Valley. Open 8 AM–11 PM daily. Cash only, 21+.`,
  keywords: [
    "cannabis dispensary Seattle",
    "cannabis dispensary Rainier Valley",
    "marijuana dispensary Seattle WA",
    "Seattle Cannabis Co",
    "weed dispensary South Seattle",
    "dispensary near Othello Station",
    "cannabis Seward Park",
    "cannabis Beacon Hill Seattle",
    "Rainier Valley dispensary since 2018",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: STORE.website,
    siteName: STORE.name,
    title: `${STORE.name} | ${STORE.neighborhood}, Seattle Cannabis Dispensary — Founded 2010`,
    description: `Premium cannabis at ${STORE.name} — 16+ yrs · Rainier Valley's longest-running, founded 2010. Flower, edibles, concentrates, vapes & more. Open daily 8 AM–11 PM.`,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${STORE.name} — Cannabis Dispensary in ${STORE.neighborhood}, Seattle`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    // `title`, `description`, AND `images` all intentionally NOT set
    // here — when omitted, Twitter's crawler falls back to og:title +
    // og:description + og:image (per Twitter Cards spec + Next 16
    // metadata cascade).
    //
    // - title: pre-fix layout hard-coded `${STORE.name} | ...` and child
    //   pages overrode openGraph.title but never twitter.title — every
    //   brand / blog / about / near / heroes share card on Twitter/X
    //   showed the layout default. Caught 2026-05-10 by /loop tick 7.
    //
    // - images: pre-fix layout hard-coded ["/opengraph-image"] (the
    //   homepage OG) and child pages override openGraph.images via the
    //   per-route `opengraph-image.tsx` convention but never twitter.
    //   So /brands/[slug] share cards on Twitter/X showed the homepage
    //   OG image instead of the per-brand custom one. Caught 2026-05-10
    //   by /loop tick 9 cross-stack og:image vs twitter:image comparison.
    //   Sister glw v13.005 same-class.
  },
  robots: { index: true, follow: true },
  // Search Console + Bing Webmaster Tools + Yandex verification —
  // env-gated. When Doug enables verification in any dashboard, paste
  // the token into the matching env var on Vercel and the meta tag
  // renders site-wide. Empty env = empty meta = no-op. Sister of
  // greenlife-web + GW + CannAgent. v… 2026-05-09 SEO arc.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: {
      ...(process.env.BING_SITE_VERIFICATION
        ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
        : {}),
      ...(process.env.YANDEX_VERIFICATION
        ? { "yandex-verification": process.env.YANDEX_VERIFICATION }
        : {}),
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Seattle Cannabis",
  },
  // iOS auto-format-detection disable. Sister glw v16.405. Already use
  // explicit `<a href="tel:…">` for actual phone (3+ hits); body text
  // with zip codes, prices, dates, license numbers gets auto-tap-target
  // styling without this. Caught by /loop tick 42 cross-stack audit.
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  // Explicit apple-touch-icon link — Next 16 doesn't auto-emit `<link
  // rel="apple-touch-icon">` for route-handler-based icons (we use
  // `app/apple-icon.png/route.tsx` for dynamic ImageResponse generation,
  // not a static binary). Without this, iOS Safari "Add to Home Screen"
  // falls back to a generic globe icon. The route already serves 200 +
  // 180×180 PNG; this just points iOS at it. Sister glw fix.
  icons: {
    apple: { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
  },
  other: {
    rating: "adult",
    // `mobile-web-app-capable` REMOVED — `appleWebApp.capable: true` above
    // already emits the modern `<meta name="mobile-web-app-capable">` (Next 16
    // upgraded the legacy `apple-mobile-web-app-capable` to the platform-
    // neutral form). Pre-fix BOTH metadata sources fired so the rendered HTML
    // contained the meta TWICE on every page — Lighthouse PWA + W3C validator
    // both flag duplicate-meta. Sister glw same-push. Caught 2026-05-10 by
    // /loop cross-stack mobile-web-app meta presence sweep.
    // Geo SEO meta — paid display + CRM ad networks (Meta/Google Ads/
    // Klaviyo) anchor location-targeted creative off these. ICBM +
    // geo.position duplicate each other on purpose; different crawlers
    // prefer different conventions. Matches greenlife-web layout.
    "geo.region": "US-WA",
    "geo.placename": `Seattle, ${STORE.neighborhood}`,
    "geo.position": `${STORE.geo.lat};${STORE.geo.lng}`,
    ICBM: `${STORE.geo.lat}, ${STORE.geo.lng}`,
  },
};

export const viewport = {
  themeColor: "#1e1b4b",
  // colorScheme: "light" — opt out of browser auto-dark-tinting on
  // form inputs / scrollbars. Sister glw v16.X + GW same-fix. Caught
  // by /loop tick 43 cross-stack color-scheme audit.
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

// Convert STORE.hours format ("8:00 AM" / "11:00 PM") → schema.org ISO 24h
// ("08:00" / "23:00"). schema.org/openingHoursSpecification REQUIRES the
// 24h ISO format; AM/PM strings fail Google Rich Results validation.
function toIso24(t: string): string {
  const [time, ampm] = t.split(" ");
  const [hStr, mStr] = time.split(":");
  let h = Number(hStr);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${mStr.padStart(2, "0")}`;
}

// Canonical Organization @id reused across schemas so Google graphs the
// LocalBusiness, WebSite, and Organization as one entity. Mirrors the
// pattern in greenlife-web/app/layout.tsx.
const ORG_ID = `${STORE.website}/#organization`;
const WEBSITE_ID = `${STORE.website}/#website`;
const LOGO_URL = `${STORE.website}/icon-512.png`;

const sameAsLinks = [
  STORE.social.instagram,
  STORE.social.facebook,
  STORE.googleMapsUrl,
].filter(Boolean);

// Organization schema — anchors brand identity. mainEntityOfPage points
// at / so a "Seattle Cannabis Co" brand search lifts the homepage, not
// /menu. Legal entity is Green Anne LLC (per RANDOM/PROJECT_BOARD memory),
// founded 2010, Rainier Valley since 2018.
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORG_ID,
  name: STORE.name,
  legalName: "Green Anne LLC",
  alternateName: ["Seattle Cannabis Co", "SCC Rainier", "Seattle Cannabis Company"],
  url: STORE.website,
  logo: {
    "@type": "ImageObject",
    url: LOGO_URL,
    width: 512,
    height: 512,
  },
  image: `${STORE.website}/opengraph-image`,
  description: `Cannabis dispensary in ${STORE.neighborhood}, Seattle — founded 2010, in Rainier Valley since 2018.`,
  foundingDate: "2010",
  foundingLocation: {
    "@type": "Place",
    name: "Seattle, WA",
  },
  areaServed: {
    "@type": "State",
    name: "Washington",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: STORE.phoneTel,
    contactType: "customer service",
    areaServed: "US-WA",
    availableLanguage: ["English"],
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `${STORE.website}/`,
  },
  sameAs: sameAsLinks,
};

// WebSite + SearchAction — enables Google's sitelinks search box. The
// {search_term_string} placeholder is part of the schema spec, not a
// Next route param. Lands on /menu (Boost embed), since "Seattle Cannabis
// Co {strain}" long-tail brand-search-with-product is what we want to
// capture.
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: STORE.website,
  name: STORE.name,
  alternateName: "Seattle Cannabis Co",
  description: `${STORE.name} — ${STORE.neighborhood} cannabis dispensary since 2010.`,
  publisher: { "@id": ORG_ID },
  inLanguage: "en-US",
  // No SearchAction — T33 → T36 revert. /order 307s to /menu (proxy.ts);
  // /menu is iHJ Boost embed not query-aware. Drop the action entirely
  // until /menu wires `?q=` passthrough. Sister glw v15.705 same-revert.
  // Doug SoT: customer CTAs point to /menu only (never /order direct).
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Store"],
  "@id": `${STORE.website}/#dispensary`,
  name: STORE.name,
  legalName: "Green Anne LLC",
  alternateName: ["Seattle Cannabis Co", "SCC Rainier", "Seattle Cannabis Company"],
  description: `Cannabis dispensary in ${STORE.neighborhood}, Seattle — founded 2010, in Rainier Valley since 2018. Premium flower, pre-rolls, vapes, concentrates, edibles, tinctures and topicals. Open daily 8 AM–11 PM. Cash only, 21+ with valid ID.`,
  slogan: STORE.tagline,
  url: STORE.website,
  image: `${STORE.website}/opengraph-image`,
  logo: LOGO_URL,
  telephone: STORE.phoneTel,
  email: STORE.email,
  foundingDate: "2010",
  parentOrganization: { "@id": ORG_ID },
  address: {
    "@type": "PostalAddress",
    streetAddress: STORE.address.street,
    addressLocality: STORE.address.city,
    addressRegion: STORE.address.state,
    postalCode: STORE.address.zip,
    addressCountry: "US",
  },
  geo: { "@type": "GeoCoordinates", latitude: STORE.geo.lat, longitude: STORE.geo.lng },
  areaServed: [
    { "@type": "City", name: "Seattle", containedInPlace: { "@type": "State", name: "Washington" } },
    ...[STORE.neighborhood, ...STORE.nearbyNeighborhoods].map((name) => ({
      "@type": "Place",
      name,
      containedInPlace: { "@type": "City", name: "Seattle" },
    })),
    // ZIP-code-level served-area (Hack #8 — Local SEO). Drives
    // "cannabis 98118" / "weed near 98178" intent — zip-code queries
    // are 2-3× higher purchase intent than city queries because they
    // typically come from people checking what's actually near them
    // RIGHT NOW. Pickup-only — these are the ZIPs we DRAW from, not
    // where we ship to. South Seattle + Skyway + Renton border only;
    // North-of-downtown ZIPs excluded since the I-5 commute makes us
    // farther than competitors for those customers.
    ...[
      { zip: "98118", area: "Rainier Valley + Columbia City + Hillman City" },
      { zip: "98144", area: "Mt Baker + Leschi" },
      { zip: "98108", area: "Beacon Hill + Georgetown" },
      { zip: "98178", area: "Skyway + Bryn Mawr" },
      { zip: "98168", area: "White Center + Tukwila border" },
      { zip: "98106", area: "South Park + West Seattle south end" },
      { zip: "98188", area: "Tukwila + SeaTac" },
      { zip: "98055", area: "Renton north" },
    ].map(({ zip, area }) => ({
      "@type": "PostalAddress",
      postalCode: zip,
      addressRegion: "WA",
      addressCountry: "US",
      description: area,
    })),
  ],
  openingHoursSpecification: STORE.hours.map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: `https://schema.org/${h.day}`,
    // ISO 24h format ("08:00") not "8:00 AM" — schema.org spec requires
    // the unambiguous form, Google Rich Results Test rejects AM/PM.
    opens: toIso24(h.open),
    closes: toIso24(h.close),
  })),
  priceRange: "$",
  currenciesAccepted: "USD",
  paymentAccepted: ["Cash"],
  hasMap: STORE.googleMapsUrl,
  identifier: {
    "@type": "PropertyValue",
    propertyID: "WSLCB License",
    value: STORE.wslcbLicense,
  },
  knowsAbout: [
    "Cannabis flower",
    "Pre-rolls",
    "Cannabis concentrates",
    "Cannabis vapes",
    "Cannabis edibles",
    "Tinctures",
    "Topicals",
    "Terpenes",
    "Cannabinoids",
    "Indica",
    "Sativa",
    "Hybrid",
    "Washington State cannabis law",
  ],
  amenityFeature: STORE.amenities.map((name) => ({
    "@type": "LocationFeatureSpecification",
    name,
    value: true,
  })),
  publicAccess: true,
  smokingAllowed: false,
  isAccessibleForFree: true,
  hasMenu: `${STORE.website}/menu`,
  potentialAction: {
    "@type": "OrderAction",
    target: `${STORE.website}${STORE.shopUrl}`,
    deliveryMethod: "http://purl.org/goodrelations/v1#DeliveryModePickUp",
  },
  // Speakable spec — tells voice assistants (Siri / Google Assistant /
  // Alexa / Apple Intelligence) which DOM nodes to read aloud when a
  // user asks "what are the hours of Seattle Cannabis Co" via a
  // voice-only surface. Pairs with `className="speakable-*"` tags on
  // the SiteFooter address + hours + phone elements.
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: [".speakable-address", ".speakable-hours", ".speakable-phone"],
  },
  sameAs: sameAsLinks,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // ClerkProvider deliberately NOT here — see app/layout.tsx in greenlife-web
  // for the full rationale. tl;dr: Clerk SDK preload on every page interferes
  // with the iHeartJane Boost embed's cross-origin XHR. Provider is now
  // scoped to /account, /sign-in, /sign-up via per-route layout.tsx.
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <head>
        {/* Resource hints — DNS + TLS prewarm for vendor-image CDNs we hit
            on home, /brands, /menu, /order. Browsers open the TCP + TLS
            connection in parallel with HTML parse instead of sequentially
            after first reference. Real Core Web Vitals win on mobile.
            Clerk hosts NOT preconnected here — ClerkProvider is scoped to
            /sign-in, /sign-up, /account via per-route layouts. */}
        <link rel="preconnect" href="https://images.squarespace-cdn.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://static.wixstatic.com" crossOrigin="anonymous" />
        {/* Three coordinated JSON-LD payloads. Together they tell Google
            (a) what the brand is (Organization), (b) that the SITE has
            a search box that should appear under the homepage in SERPs
            (WebSite + SearchAction — sitelinks searchbox), and (c) the
            full physical-place NAP+hours+geo (LocalBusiness/Store). The
            shared @id graph (ORG_ID, WEBSITE_ID, #dispensary) lets the
            knowledge graph stitch them. Adding the Organization +
            WebSite schemas makes / outrank /menu in brand searches —
            without them, Google has no signal that / is the canonical
            entity hub. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(localBusinessSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        {/* Skip-to-main — keyboard + screen-reader users tab here first
            so they can bypass the header/announcement nav. Visually hidden
            until focused, then becomes a fixed pill at the top-left. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-indigo-700 focus:text-white focus:font-bold focus:text-sm focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <AgeGate />
        <AnnouncementBar />
        <SiteHeader />
        <CartResumeBanner />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <MobileStickyCta />
        <ServiceWorkerRegister />
        <InstallAppBanner />
        {/* GA4 — auto-loads when Doug pastes a "G-XXXXXXX" measurement
            ID into NEXT_PUBLIC_GA_ID on Vercel. Empty env = nothing
            renders. afterInteractive so it doesn't block hydration.
            Sister pattern to GW + greenlife-web. */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{page_path:window.location.pathname});`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
