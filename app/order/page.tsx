import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { STORE } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Order for Pickup",
  description: `Order cannabis online for pickup at ${STORE.name}. Browse flower, edibles, vapes, concentrates and more. Pay cash in store.`,
  alternates: { canonical: "/order" },
  openGraph: {
    title: `Order for Pickup | ${STORE.name}`,
    description: `Pickup-ready cannabis menu in ${STORE.neighborhood}, Seattle. Cash in store, points on every order.`,
    url: `${STORE.website}/order`,
    type: "website",
  },
};

// TEMPORARILY REDIRECTED 2026-05-04 per Doug — Seattle inventoryapp DB has
// Wenatchee-seeded prices on shared-ID products (per OUTSTANDING_WORK 3.9
// + INCIDENTS.md), so the in-tree menu shows wrong prices for Seattle until
// a Dutchie sync reconciles them. /menu (iHeartJane Boost embed at storeId
// 5295) shows the real Dutchie Seattle prices, so push customers there.
//
// Restore: replace this stub with the original implementation (preserved in
// git at SHA 4cbe36a / v3.50: app/order/page.tsx) when the price sync ships.
export default async function OrderPage() {
  redirect("/menu");
}
