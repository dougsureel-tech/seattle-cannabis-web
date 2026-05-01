import type { Metadata } from "next";
import { STORE } from "@/lib/store";
import { JaneMenu } from "./JaneMenu";

export const metadata: Metadata = {
  title: "Menu",
  description: `Browse ${STORE.name}'s full cannabis menu — flower, edibles, vapes, concentrates, pre-rolls, and tinctures. Seattle, WA.`,
  alternates: { canonical: "/menu" },
};

const menuSchema = {
  "@context": "https://schema.org",
  "@type": "Menu",
  "@id": `${STORE.website}/menu#menu`,
  name: `${STORE.name} Cannabis Menu`,
  description: `Live cannabis menu at ${STORE.name} — flower, pre-rolls, vapes, concentrates, edibles, tinctures, and topicals. Updated daily. ${STORE.address.full}.`,
  url: `${STORE.website}/menu`,
  inLanguage: "en-US",
  offeredBy: { "@id": `${STORE.website}/#dispensary` },
  hasMenuSection: [
    { "@type": "MenuSection", name: "Flower" },
    { "@type": "MenuSection", name: "Pre-Rolls" },
    { "@type": "MenuSection", name: "Vapes" },
    { "@type": "MenuSection", name: "Concentrates" },
    { "@type": "MenuSection", name: "Edibles" },
    { "@type": "MenuSection", name: "Tinctures" },
    { "@type": "MenuSection", name: "Topicals" },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
    { "@type": "ListItem", position: 2, name: "Menu", item: `${STORE.website}/menu` },
  ],
};

export default function MenuPage() {
  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(menuSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="bg-indigo-950 text-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">Live Menu</p>
          <h1 className="text-4xl font-extrabold tracking-tight">Our Menu</h1>
          <p className="text-indigo-300/70 mt-2 text-sm">
            {STORE.address.city}, WA · Updated daily · Must be 21+ to purchase
          </p>
        </div>
      </div>
      {STORE.iheartjaneStoreId > 0 ? (
        <JaneMenu storeId={STORE.iheartjaneStoreId} />
      ) : (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center space-y-4">
          <p className="text-stone-500">Menu coming soon — call us for today&apos;s selection.</p>
          <a href={`tel:${STORE.phoneTel}`} className="inline-block px-5 py-2.5 rounded-xl bg-indigo-800 text-white font-medium text-sm hover:bg-indigo-700 transition-colors">
            Call {STORE.phone}
          </a>
        </div>
      )}
    </div>
  );
}
