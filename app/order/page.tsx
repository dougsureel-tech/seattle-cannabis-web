import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { STORE, DEFAULT_OG_IMAGE} from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Order for Pickup",
  description: `Order cannabis online for pickup at ${STORE.name} Browse flower, edibles, vapes, concentrates and more. Pay cash in store.`,
  alternates: { canonical: "/order" },
  openGraph: {
    siteName: STORE.name,
    locale: "en_US",
    title: `Order for Pickup | ${STORE.name}`,
    description: `Pickup-ready cannabis menu in ${STORE.neighborhood}, Seattle. Cash in store, points on every order.`,
    url: `${STORE.website}/order`,
    type: "website",
    // Sister of glw v7.585. Next 16 metadata cascade replaces parent
    // images; explicit ref keeps share-previews image-correct.
    images: [DEFAULT_OG_IMAGE],
  },
};

// CANONICAL ORDER SURFACE IS /menu — /order redirects here.
//
// HISTORICAL CONTEXT:
// 2026-05-04 — initially redirected as a temporary fix while the Seattle
// inventoryapp DB had Wenatchee-seeded prices on shared-ID products
// (OUTSTANDING_WORK 3.9 + INCIDENTS.md). /menu (iHeartJane Boost embed,
// storeId 5295) shows the real Dutchie Seattle prices.
//
// 2026-05-XX onward — the redirect became the PERMANENT pattern per
// `feedback_customer_ctas_point_to_menu_only.md` memory pin + the
// `scripts/check-customer-cta-order-href.mjs` arc-guard (baseline 0).
// All customer CTAs point at /menu; /order is preserved as a redirect
// so stale share-links + bookmarks land on the canonical surface.
//
// Original /order implementation (in-tree menu) is preserved in git at
// SHA 4cbe36a / v3.50: app/order/page.tsx if a future product decision
// reverses the canonical-surface pin. The /menu surface itself is still
// blocked on iHeartJane CORS re-authorization (see MENU_LOG.md), which
// is partner-action not code.
export default async function OrderPage() {
  redirect("/menu");
}
