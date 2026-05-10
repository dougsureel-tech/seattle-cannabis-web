import type { MetadataRoute } from "next";
import { STORE } from "@/lib/store";

// Revalidate every hour at CDN edge — manifest is fully static (only
// changes at deploy boundary). Sister of inv v342.605 + glw v8.165
// cross-repo port.
export const revalidate = 3600;

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: STORE.name,
    short_name: "Seattle Cannabis",
    description: `${STORE.tagline}. ${STORE.address.full}.`,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1e1b4b",
    theme_color: "#1e1b4b",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // PWA app-shortcuts. T35 → T36 revert: "Order for Pickup" goes back
    // to /menu (proxy.ts 307s /order → /menu in prod, and Boost provides
    // the cart flow natively inside the embed). Sister glw v15.705
    // same-revert. (GW T35 standalone-display change is unaffected — no
    // /order route on GW.) Account description fix preserved.
    shortcuts: [
      { name: "Order for Pickup", short_name: "Order", url: "/menu", description: "Place a pickup order" },
      { name: "Browse Menu", short_name: "Menu", url: "/menu", description: "See what's in stock today" },
      { name: "Rewards", short_name: "Rewards", url: "/rewards", description: "Points balance + redemption catalog" },
      { name: "Account", short_name: "Account", url: "/account", description: "Profile + order history" },
    ],
  };
}
