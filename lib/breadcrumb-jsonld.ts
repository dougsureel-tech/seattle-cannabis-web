import { STORE } from "@/lib/store";

// BreadcrumbList JSON-LD helper. Gives Google + AI engines an explicit
// site graph for citation context — when an AI cites a deep page, the
// breadcrumb tells it the navigational path so the answer can frame
// "according to Seattle Cannabis Co > Brands > Avitas" instead of just
// "according to Seattle Cannabis Co."
//
// Returns the JSON object — wrap in `<script type="application/ld+json"
// dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(...)) }} />`
// at the page level. Crumbs are absolute-URL'd against STORE.website so
// the schema renders the same regardless of which canonical alias the
// page is served from.

export type Crumb = { name: string; url: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  // Stable @id derived from the LAST crumb's URL (sister of glw v19.105
  // same-fix). Lets sibling JSON-LD nodes reference the breadcrumb via
  // @id without duplicating the path. Entity-graph @id linking pattern
  // T85 → T87 → T88 → T89 → T90 → T91 close-out.
  const last = crumbs[crumbs.length - 1];
  const lastAbs = last
    ? (last.url.startsWith("http") ? last.url : `${STORE.website}${last.url.startsWith("/") ? "" : "/"}${last.url}`)
    : STORE.website;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${lastAbs}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url.startsWith("http") ? c.url : `${STORE.website}${c.url.startsWith("/") ? "" : "/"}${c.url}`,
    })),
  };
}

// Convenience: the home crumb every page graph starts with.
export const HOME_CRUMB: Crumb = { name: STORE.name, url: "/" };
