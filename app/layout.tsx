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
    default: `${STORE.name} | Cannabis Dispensary Seattle, WA`,
    template: `%s | ${STORE.name}`,
  },
  description: `${STORE.name} — ${STORE.neighborhood} cannabis dispensary at ${STORE.address.full}. Open daily 8am–11pm. Founded 2010, rooted in Rainier Valley since 2018. Serving Rainier Valley, Seward Park, Beacon Hill & South Seattle.`,
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
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: STORE.name,
  },
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Seattle Cannabis",
  },
  other: { rating: "adult", "mobile-web-app-capable": "yes" },
};

export const viewport = {
  themeColor: "#1e1b4b",
  width: "device-width",
  initialScale: 1,
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Store"],
  "@id": `${STORE.website}/#dispensary`,
  name: STORE.name,
  legalName: STORE.name,
  alternateName: ["Seattle Cannabis Co", "SCC Rainier", "Seattle Cannabis Company"],
  description: `Cannabis dispensary in ${STORE.neighborhood}, Seattle — founded 2010, in Rainier Valley since 2018. Premium flower, pre-rolls, vapes, concentrates, edibles, tinctures and topicals. Open daily 8 AM–11 PM. Cash only, 21+ with valid ID.`,
  slogan: STORE.tagline,
  url: STORE.website,
  telephone: STORE.phoneTel,
  email: STORE.email,
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
    opens: h.open,
    closes: h.close,
  })),
  priceRange: "$$",
  currenciesAccepted: "USD",
  paymentAccepted: "Cash",
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
  sameAs: [STORE.social.instagram, STORE.social.facebook].filter(Boolean),
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
