import type { MetadataRoute } from "next";
import { STORE } from "@/lib/store";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /account is user-specific and has no SEO value.
      disallow: ["/account"],
    },
    sitemap: `${STORE.website}/sitemap.xml`,
    host: STORE.website,
  };
}
