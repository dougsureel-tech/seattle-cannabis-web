import type { Metadata } from "next";
import { STORE } from "@/lib/store";
import { JaneMenu } from "./JaneMenu";

// /menu = iHeartJane Jane Boost (iframeless) embed. Customer stays on
// seattlecannabis.co — the Boost JS module hydrates the menu inline.
// Naive iframe is blocked (iHeartJane sets X-Frame-Options: SAMEORIGIN).
//
// Config + script tags live in JaneMenu.tsx. NOTE: Seattle (storeId 5295)
// currently shares Wenatchee's embedConfigId 234 as a placeholder. Seattle
// was never on the WordPress site so iHeartJane never provisioned a
// dedicated Boost config. If the menu fails to render here, Doug needs
// to email iHeartJane partner support for a per-store embedConfigId.
// See INCIDENTS.md (2026-05-01 entry).

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
// PLACEHOLDER: same as Wenatchee until iHeartJane provisions a Seattle-specific
// Boost config. Doug to email partner support.
const IHEARTJANE_EMBED_CONFIG_ID = 234;

export default function MenuPage() {
  return (
    <div className="bg-stone-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">Live Menu</h1>
        <p className="text-sm text-stone-600">
          Real-time inventory from {STORE.name}. Pickup orders open daily 8 AM–{STORE.hours[0]?.close ?? "11 PM"}. Cash only at the counter, 21+ with valid ID.
        </p>
      </div>
      <JaneMenu storeId={IHEARTJANE_STORE_ID} embedConfigId={IHEARTJANE_EMBED_CONFIG_ID} />
    </div>
  );
}
