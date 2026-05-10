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
    // PWA app-shortcuts. "Order for Pickup" retargeted /menu → /order
    // (iHJ Boost embed has no cart; /order has the real cart-able
    // surface). Sister glw same-fix v15.505 + T33 SearchAction.
    shortcuts: [
      { name: "Order for Pickup", short_name: "Order", url: "/order", description: "Place a pickup order" },
      { name: "Browse Menu", short_name: "Menu", url: "/menu", description: "See what's in stock today" },
      { name: "Rewards", short_name: "Rewards", url: "/rewards", description: "Points balance + redemption catalog" },
      { name: "Account", short_name: "Account", url: "/account", description: "Profile + order history" },
    ],
  };
}
