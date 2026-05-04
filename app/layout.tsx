import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AgeGate } from "@/components/AgeGate";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileStickyCta } from "@/components/MobileStickyCta";
import { CartResumeBanner } from "@/components/CartResumeBanner";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { STORE } from "@/lib/store";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(STORE.website),
  title: {
    // Brand-anchor title with founded year + neighborhood. Brand-search
    // ("Seattle Cannabis Co") should land on / not /menu, which means /
    // needs a tighter primary title than the live-menu page.
    default: `${STORE.name} | Cannabis Dispensary in ${STORE.neighborhood}, Seattle — Founded 2010`,
    template: `%s | ${STORE.name}`,
  },
  description: `${STORE.name} — ${STORE.neighborhood} cannabis dispensary at ${STORE.address.full}. Open daily 8 AM–11 PM. Founded 2010, rooted in Rainier Valley since 2018. Serving Rainier Valley, Seward Park, Beacon Hill, Mount Baker, Columbia City & Othello. Cash only, 21+.`,
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
    title: `${STORE.name} | ${STORE.neighborhood}, Seattle`,
    description: `${STORE.neighborhood} cannabis dispensary, founded 2010. Cash only, 21+. ${STORE.address.full}.`,
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Seattle Cannabis",
  },
  other: {
    rating: "adult",
    "mobile-web-app-capable": "yes",
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
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${STORE.website}/menu?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
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
    target: STORE.shopUrl,
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
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
      </body>
    </html>
  );
}
