import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";

// BreadcrumbList JSON-LD — sister of cannagent v3.391 100% indexable
// coverage + glw v12.505. Pre-fix /careers had no BreadcrumbList;
// Google could not show the breadcrumb chip in SERP results.
const breadcrumb = breadcrumbJsonLd([
  { name: "Home", url: STORE.website },
  { name: "Careers", url: `${STORE.website}/careers` },
]);

// ISR — open-positions list refreshes every 5 minutes. Inventoryapp side is
// the source of truth; a stale cache for up to 5 min is fine for a careers page.
export const revalidate = 300;

// Canonical staff URL (brapp.*), not the Vercel-internal alias. Sister of
// glw same-day fix. Same Vercel deployment, just stable DNS.
const POSITIONS_API =
  "https://brapp.seattlecannabis.co/api/positions/open?store=seattle";

interface Position {
  id: string;
  title: string;
  role_match?: string | null;
  store_origin?: "wenatchee" | "seattle" | "either" | null;
  description_md?: string | null;
  pay_range?: string | null;
  hours_pattern?: string | null;
  posted_at?: string | null;
}

interface PositionsResponse {
  positions: Position[];
}

// Server-side fetch with a 5s timeout. On any failure (timeout, DNS, parse,
// non-200) we fall through to the empty state so visitors still see the warm
// "we keep good resumes on file" copy + Apply CTA.
async function fetchOpenPositions(): Promise<Position[]> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(POSITIONS_API, {
      signal: ctrl.signal,
      next: { revalidate: 300 },
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const json = (await res.json().catch(() => null)) as PositionsResponse | null;
    if (!json || !Array.isArray(json.positions)) return [];
    return json.positions;
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  // Trimmed 2026-05-10 — title-template `· {brand}` suffix was producing
  // "Careers — Seattle Cannabis Co. | Seattle Cannabis Co." (duplicate
  // brand). title.absolute bypasses the suffix; brand kept once.
  title: { absolute: "Careers — Rainier Valley Cannabis | Seattle Cannabis Co." },
  description: `Open positions at ${STORE.name} in Rainier Valley, Seattle. Apply online — we review every application.`,
  alternates: { canonical: "/careers" },
  openGraph: {
    locale: "en_US",
    title: `Careers at ${STORE.name}`,
    description: `Open positions at Seattle Cannabis Co. — Rainier Valley, since 2018; same crew, since 2010.`,
    url: `${STORE.website}/careers`,
    type: "website",
    images: ["/opengraph-image"],
  },
};

export default async function CareersPage() {
  const positions = await fetchOpenPositions();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {/* Hero — indigo/violet gradient matching the rest of the SCC chrome. */}
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
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 80% 50%, #818cf8, transparent)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-2">
            Careers
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Work with us at Seattle Cannabis Co.
          </h1>
          <p className="text-indigo-200/80 mt-3 text-sm sm:text-base leading-relaxed max-w-2xl">
            We&apos;ve been part of Seattle&apos;s cannabis story since 2010 — same crew,
            same care, on Rainier since 2018. We&apos;re looking for people who take the
            work seriously, treat customers like neighbors, and want a shop that&apos;s
            still here in another fifteen years. If that sounds like you, we&apos;d love
            to hear from you.
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {positions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-5">
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              Open positions
            </h2>
            <p className="text-stone-600 text-sm">
              {positions.length === 1
                ? "1 open role right now."
                : `${positions.length} open roles right now.`}
            </p>
            <div className="space-y-4">
              {positions.map((p) => (
                <PositionCard key={p.id} p={p} />
              ))}
            </div>

            {/* General apply nudge below the list. */}
            <div className="mt-10 rounded-2xl border border-stone-200 bg-stone-50 p-6 text-center">
              <p className="text-sm text-stone-700">
                Don&apos;t see a perfect fit? We keep good resumes on file.
              </p>
              <Link
                href="/apply"
                className="inline-flex items-center justify-center mt-3 px-5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-800 text-sm font-bold hover:border-indigo-400 hover:text-indigo-800 transition-colors"
              >
                Apply anyway →
              </Link>
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-indigo-700 transition-colors"
          >
            ← Back to menu
          </Link>
        </div>
      </main>
    </>
  );
}

// ── Position card ─────────────────────────────────────────────────────────

function PositionCard({ p }: { p: Position }) {
  const storeBadges = storeBadgesFor(p);
  return (
    <article className="rounded-2xl border border-stone-200 bg-white shadow-sm p-5 sm:p-7 hover:border-indigo-300 transition-colors">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-xl font-extrabold text-stone-900 tracking-tight">
            {p.title}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {storeBadges.map((b) => (
              <span
                key={b}
                className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 text-[11px] font-bold uppercase tracking-wider border border-indigo-200"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {(p.pay_range || p.hours_pattern) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {p.pay_range && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200">
              {p.pay_range}
            </span>
          )}
          {p.hours_pattern && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200">
              {p.hours_pattern}
            </span>
          )}
        </div>
      )}

      {p.description_md && (
        <div className="text-sm text-stone-700 leading-relaxed space-y-3 mb-5">
          {renderSafeMarkdown(p.description_md)}
        </div>
      )}

      <Link
        href={`/apply?position=${encodeURIComponent(p.id)}`}
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-sm font-bold transition-colors shadow-sm"
      >
        Apply for this role →
      </Link>
    </article>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white shadow-sm p-8 sm:p-12 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mb-5">
        <svg
          className="w-7 h-7 text-indigo-700"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
        We&apos;re not actively hiring right now
      </h2>
      <p className="text-stone-600 text-sm sm:text-base leading-relaxed mt-3 max-w-md mx-auto">
        But we keep good resumes on file. If you&apos;d be a great fit when something opens
        up, we&apos;d love to meet you — apply anytime.
      </p>
      <Link
        href="/apply"
        className="inline-flex items-center justify-center mt-6 px-6 py-3 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-sm font-bold transition-colors shadow-sm"
      >
        Apply →
      </Link>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

function storeBadgesFor(p: Position): string[] {
  const match = p.store_origin ?? null;
  if (match === "wenatchee") return ["Wenatchee"];
  if (match === "seattle") return ["Seattle"];
  if (match === "either") return ["Wenatchee", "Seattle"];
  return ["Seattle"]; // default — this is the Seattle site
}

// Tiny safe markdown renderer (mirror of greenlife-web). Supports paragraphs,
// bullets ("- "), and bold (**text**). No HTML pass-through, no link rendering,
// no images. XSS-safe contract: description_md from inventoryapp API is NOT
// trusted.
function renderSafeMarkdown(md: string): React.ReactNode[] {
  const blocks = md
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  return blocks.map((block, bi) => {
    const lines = block.split("\n");
    const isBulletBlock = lines.every((ln) => ln.trimStart().startsWith("- "));
    if (isBulletBlock) {
      return (
        <ul key={bi} className="list-disc pl-5 space-y-1.5">
          {lines.map((ln, li) => (
            <li key={li}>{renderInlineBold(ln.trimStart().slice(2))}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={bi}>
        {lines.map((ln, li) => (
          <span key={li}>
            {renderInlineBold(ln)}
            {li < lines.length - 1 && <br />}
          </span>
        ))}
      </p>
    );
  });
}

function renderInlineBold(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push(<span key={`t${i}`}>{text.slice(last, m.index)}</span>);
    }
    out.push(<strong key={`b${i}`}>{m[1]}</strong>);
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) {
    out.push(<span key={`t${i}`}>{text.slice(last)}</span>);
  }
  return out;
}
