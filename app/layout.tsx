import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AgeGate } from "@/components/AgeGate";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { STORE } from "@/lib/store";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(STORE.website),
  title: {
    default: `${STORE.name} | Cannabis Dispensary Seattle, WA`,
    template: `%s | ${STORE.name}`,
  },
  description: `${STORE.name} — ${STORE.neighborhood} cannabis dispensary at ${STORE.address.full}. Open daily 8am–11pm. Veteran-owned. Serving Rainier Valley, Seward Park, Beacon Hill & South Seattle.`,
  keywords: [
    "cannabis dispensary Seattle",
    "cannabis dispensary Rainier Valley",
    "marijuana dispensary Seattle WA",
    "Seattle Cannabis Co",
    "weed dispensary South Seattle",
    "dispensary near Othello Station",
    "cannabis Seward Park",
    "cannabis Beacon Hill Seattle",
    "veteran owned dispensary Seattle",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: STORE.name,
  },
  robots: { index: true, follow: true },
  other: { rating: "adult" },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Store"],
  "@id": `${STORE.website}/#dispensary`,
  name: STORE.name,
  legalName: STORE.name,
  alternateName: ["Seattle Cannabis Co", "SCC Rainier", "Seattle Cannabis Company"],
  description: `Veteran-owned cannabis dispensary in ${STORE.neighborhood}, Seattle. Premium flower, pre-rolls, vapes, concentrates, edibles, tinctures and topicals. Open daily 8 AM–11 PM. Cash only, 21+ with valid ID.`,
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
    "Cannabis flower", "Pre-rolls", "Cannabis concentrates", "Cannabis vapes",
    "Cannabis edibles", "Tinctures", "Topicals", "Terpenes", "Cannabinoids",
    "Indica", "Sativa", "Hybrid", "Washington State cannabis law",
  ],
  amenityFeature: STORE.amenities.map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
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
  return (
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} h-full`}>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
          />
        </head>
        <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
          <AgeGate />
          <AnnouncementBar />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </body>
      </html>
    </ClerkProvider>
  );
}
