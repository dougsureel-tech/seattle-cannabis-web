import type { MetadataRoute } from "next";
import { STORE } from "@/lib/store";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /account is user-specific and has no SEO value. /api is internal
      // noise; /sign-in + /sign-up are auth pages with no public utility
      // — keep them out of the crawl budget so Google focuses on the
      // brand-anchor pages.
      disallow: ["/account", "/api/", "/sign-in", "/sign-up"],
    },
    sitemap: `${STORE.website}/sitemap.xml`,
    host: STORE.website,
  };
}
