import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/posts";
import { STORE, STORE_TZ } from "@/lib/store";
import { safeJsonLd } from "@/lib/json-ld-safe";

type Props = { params: Promise<{ slug: string }> };

// dynamicParams=false means only the slugs from generateStaticParams() are
// served — unknown slugs return a real 404 (not the soft-404 / 200-with-
// "not found"-content that Next.js 16 emits by default when dynamicParams=true).
// SEO impact: Google distinguishes 200-with-error-content from real 404; soft
// 404s on /blog/[slug] hurt the blog index's authority.
export const dynamicParams = false;

export async function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    // title.absolute drops the template's ` | Seattle Cannabis Co.` suffix
    // so the article title alone fills the SERP slot. Pre-fix titles like
    // "The Complete Guide to Cannabis in Rainier Valley & South Seattle"
    // rendered at 87 chars after suffix — Google truncated mid-word.
    // Brand attribution moves to BreadcrumbList JSON-LD. Sister glw same-push.
    title: { absolute: post.title },
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      siteName: STORE.name,
      locale: "en_US",
      title: post.title,
      description: post.description,
      type: "article",
      url: `${STORE.website}/blog/${slug}`,
      publishedTime: post.publishedAt,
      ...(post.updatedAt ? { modifiedTime: post.updatedAt } : {}),
      // article:section + article:tag — Facebook/LinkedIn render the
      // section as a small pill above the share-card title; tags help
      // taxonomic clustering. Sister glw + GW same-push.
      section: post.category,
      tags: [post.category],
      // Per-post OG image at /blog/{slug}/opengraph-image (per-route file
      // convention). Pre-fix DEFAULT_OG_IMAGE override made the per-route
      // file dead code — share-cards rendered homepage OG instead of
      // post-specific. Sister glw same-fix. Caught by /loop tick 48.
      images: [
        {
          url: `/blog/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

function renderMarkdown(md: string): React.ReactElement[] {
  const lines = md.split("\n");
  const blocks: React.ReactElement[] = [];
  let i = 0;
  let bulletBuffer: string[] = [];

  function flushBullets() {
    if (bulletBuffer.length === 0) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="list-disc pl-6 space-y-1.5 text-stone-700 leading-relaxed">
        {bulletBuffer.map((b, idx) => (
          <li key={idx}>{renderInline(b)}</li>
        ))}
      </ul>,
    );
    bulletBuffer = [];
  }

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("### ")) {
      flushBullets();
      blocks.push(
        <h3 key={blocks.length} className="text-xl font-bold text-stone-900 mt-8 mb-2">
          {line.slice(4)}
        </h3>,
      );
    } else if (line.startsWith("## ")) {
      flushBullets();
      blocks.push(
        <h2 key={blocks.length} className="text-2xl font-extrabold text-stone-900 mt-10 mb-3 tracking-tight">
          {line.slice(3)}
        </h2>,
      );
    } else if (line.startsWith("- ")) {
      bulletBuffer.push(line.slice(2));
    } else if (line.trim() === "") {
      flushBullets();
    } else {
      flushBullets();
      blocks.push(
        <p key={blocks.length} className="text-stone-700 leading-relaxed">
          {renderInline(line)}
        </p>,
      );
    }
    i++;
  }
  flushBullets();
  return blocks;
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = linkRe.exec(text)) !== null) {
    if (match.index > cursor) parts.push(boldify(text.slice(cursor, match.index), `t-${cursor}`));
    parts.push(
      <Link
        key={`l-${match.index}`}
        href={match[2]}
        className="text-indigo-700 underline underline-offset-2 hover:text-indigo-600"
      >
        {boldify(match[1], `lt-${match.index}`)}
      </Link>,
    );
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) parts.push(boldify(text.slice(cursor), `tail-${cursor}`));
  return parts;
}

function boldify(text: string, key: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    parts.push(
      <strong key={`${key}-${match.index}`} className="font-bold text-stone-900">
        {match[1]}
      </strong>,
    );
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <span key={key}>{parts}</span>;
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const url = `${STORE.website}/blog/${slug}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    url,
    datePublished: post.publishedAt,
    ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
    inLanguage: "en-US",
    isPartOf: { "@id": `${STORE.website}/blog#blog` },
    publisher: { "@id": `${STORE.website}/#dispensary` },
    author: { "@type": "Organization", name: STORE.name, url: STORE.website },
    articleSection: post.category,
    wordCount: post.body.split(/\s+/).length,
    // Article rich-result eligibility requires `image`. Sister glw v7.625.
    image: [`${STORE.website}/opengraph-image`],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${STORE.website}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />

      {/* Hero — gradient bookend matching the rest of the site. */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-violet-950 to-indigo-950 text-white py-10 sm:py-14">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(ellipse 60% 50% at 80% 50%, #818cf8, transparent)" }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 space-y-3">
          <Link
            href="/blog"
            className="text-indigo-400 text-xs font-bold uppercase tracking-widest hover:text-indigo-300 transition-colors inline-block"
          >
            ← Field Notes
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">{post.title}</h1>
          <div className="flex items-center gap-3 text-xs text-indigo-300/70 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-900/60 border border-indigo-800 text-indigo-200 font-semibold">
              {post.category}
            </span>
            <span className="tabular-nums">
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                timeZone: STORE_TZ,
              })}
            </span>
            <span className="opacity-50">·</span>
            <span>{post.readingMinutes} min read</span>
          </div>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12 space-y-3">
        {renderMarkdown(post.body)}
      </article>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-950 via-violet-950 to-indigo-950 text-white p-6 text-center space-y-3">
          <p className="font-bold text-lg">Come visit us in {STORE.neighborhood}</p>
          <p className="text-indigo-300/70 text-sm max-w-sm mx-auto">
            {STORE.address.full} · Open daily 8 AM–11 PM · Cash only · 21+ with valid ID
          </p>
          <div className="flex justify-center gap-3 flex-wrap pt-1">
            <Link
              href="/menu"
              className="px-4 py-2 rounded-xl bg-indigo-300 hover:bg-indigo-200 text-indigo-950 text-sm font-bold transition-colors"
            >
              Browse Menu
            </Link>
            <a
              href={STORE.shopUrl}
              className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white text-sm font-semibold transition-colors"
            >
              Order Online — 20% Off
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
