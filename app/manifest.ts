import type { MetadataRoute } from "next";
import { STORE } from "@/lib/store";

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
    shortcuts: [
      { name: "Order Online", short_name: "Order", url: "/order" },
      { name: "Browse Menu", short_name: "Menu", url: "/menu" },
      { name: "Account", short_name: "Account", url: "/account" },
    ],
  };
}
