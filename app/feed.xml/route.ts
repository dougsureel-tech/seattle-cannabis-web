import { STORE } from "@/lib/store";
import { getPosts } from "@/lib/posts";

// RSS 2.0 feed for the /blog content. Sister of glw v18.905 same shape.
// Pre-fix scc published blog posts with no machine-readable feed —
// /feed.xml + /rss.xml + /atom.xml all 404, /feed → /blog 308 served HTML
// to feed parsers (useless). Feedly/NewsBlur/Inoreader couldn't subscribe;
// GPTBot/ClaudeBot/PerplexityBot probe /feed.xml as a structured-content
// surface and got nothing.
//
// Cache: 30-min edge cache (sister of sitemap.xml at v9.385). Blog posts
// rarely change post-publish; 30 min cuts ~99% of repeat-fetcher cost.
export const revalidate = 1800;

// Minimal XML escape — RSS spec requires title/description escaped (or
// CDATA). 5 entities cover the cases we emit.
function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(): Promise<Response> {
  const posts = getPosts();
  const sorted = [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const lastBuildDate =
    sorted.length > 0
      ? new Date(sorted[0].publishedAt).toUTCString()
      : new Date().toUTCString();

  const items = sorted
    .map((post) => {
      const url = `${STORE.website}/blog/${post.slug}`;
      const pubDate = new Date(post.publishedAt).toUTCString();
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(post.category)}</category>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${STORE.name} — Blog`)}</title>
    <link>${STORE.website}/blog</link>
    <atom:link href="${STORE.website}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(`Cannabis education, vendor spotlights, and dispatches from ${STORE.address.city}, WA — written by the counter team at ${STORE.name}. 21+.`)}</description>
    <language>en-US</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
