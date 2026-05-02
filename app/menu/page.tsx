import type { Metadata } from "next";
import { STORE } from "@/lib/store";
import { JaneMenu } from "./JaneMenu";

// /menu = iHeartJane embedded menu. Customer stays on seattlecannabis.co/menu,
// the iHeartJane SDK injects the live store at iheartjane.com/stores/5295.
//
// A naive <iframe> can't be used because iHeartJane sets X-Frame-Options:
// SAMEORIGIN on every URL — the browser refuses to render. The official
// embed.js SDK is the only path that actually works.
//
// Future: when the in-house menu + checkout are ready, swap this back to
// the live-inventory page (preserved in seattle-cannabis-web git history).

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Cannabis Menu — Live Inventory",
  description: `Live cannabis menu at ${STORE.name} in ${STORE.address.city}, WA. Flower, pre-rolls, vapes, concentrates, edibles, tinctures, and topicals from 100+ Washington-state producers. Order ahead for cash pickup. 21+, ID required.`,
  alternates: { canonical: "/menu" },
  openGraph: {
    title: `Cannabis Menu | ${STORE.name}`,
    description: `Live cannabis menu — prices, THC/CBD, lab data. ${STORE.address.full}.`,
    url: `${STORE.website}/menu`,
    type: "website",
  },
};

const IHEARTJANE_STORE_ID = 5295;

export default function MenuPage() {
  return (
    <div className="bg-stone-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">Live Menu</h1>
        <p className="text-sm text-stone-600">
          Real-time inventory from {STORE.name}. Pickup orders open daily 8 AM–{STORE.hours[0]?.close ?? "11 PM"}. Cash only at the counter, 21+ with valid ID.
        </p>
      </div>
      <JaneMenu storeId={IHEARTJANE_STORE_ID} />
    </div>
  );
}
