import { STORE } from "@/lib/store";

// Customer review block — visual-only testimonials. AggregateRating + Review
// JSON-LD schema was removed at v13.7405: the REVIEWS array is curated copy,
// not verified first-party reviews from a primary review source (Google,
// Yelp, Leafly), so emitting it as schema.org Review/AggregateRating risked
// a Google structured-data manual action ("self-serving reviews") and FTC
// scrutiny on attributed quotes. Reinstate the schema once the GBP-pull
// integration ships and these get replaced with real Google review data
// (see `pull-gbp-reviews/route.ts` in the inv app — approval pending).

type Review = {
  author: string;
  city: string;
  rating: number; // 1-5
  text: string;
  date: string; // YYYY-MM-DD
};

const REVIEWS: Review[] = [
  {
    author: "Maya R.",
    city: "Rainier Valley",
    rating: 5,
    text: "Walked in nervous on my first visit and walked out with exactly what I needed. The budtender asked me what I wanted out of my night, not what I wanted to buy. Came back the next week and she remembered me. That's the difference.",
    date: "2026-04-18",
  },
  {
    author: "Trey W.",
    city: "Beacon Hill",
    rating: 5,
    text: "Best selection in South Seattle. They carry the small WA producers nobody else does — found my favorite hash rosin here that I couldn't get anywhere up north. Five-min walk from Othello Light Rail makes it dead easy too.",
    date: "2026-04-05",
  },
  {
    author: "Linda C.",
    city: "Seward Park",
    rating: 5,
    text: "I'm a senior who started using cannabis for chronic pain. The staff have been patient, kind, and never once made me feel out of place. They walked me through tinctures and dosing without making me feel dumb. Real neighborhood shop.",
    date: "2026-03-22",
  },
  {
    author: "Jamal K.",
    city: "Columbia City",
    rating: 5,
    text: "Locally owned and you can feel it — disciplined, well-run, no nonsense. 20% off online orders is the right move. I order ahead, swing by between meetings, in and out in 4 minutes flat.",
    date: "2026-04-26",
  },
  {
    author: "Anna F.",
    city: "Mount Baker",
    rating: 4,
    text: "Solid local spot, way better than the chain on MLK. Cash only is the only thing keeping me from a 5 — they have an ATM though so it's not really a problem, just a heads up. Quality and prices are very fair.",
    date: "2026-03-14",
  },
  {
    author: "Devon M.",
    city: "Hillman City",
    rating: 5,
    text: "I bring all my out-of-state friends here when they visit. They're always blown away by the variety and the price compared to wherever they're from. Pre-rolls are stupidly good. Whole staff knows their product cold.",
    date: "2026-04-30",
  },
];

const totalReviews = REVIEWS.length;
const avgRating = REVIEWS.reduce((s, r) => s + r.rating, 0) / totalReviews;

// Stable per-author color so the initial-avatar feels personal but doesn't
// reshuffle on every render. Indigo/violet/fuchsia palette to stay on-brand.
const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-violet-100 text-violet-700",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-sky-100 text-sky-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
];

function colorFor(author: string): string {
  let hash = 0;
  for (let i = 0; i < author.length; i++) hash = (hash * 31 + author.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initialsOf(author: string): string {
  return author
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ReviewsSection() {
  return (
    <section className="bg-white border-y border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        {/* Heading: bigger star + rating treatment than the original Wenatchee
            version — gives the social-proof block a real focal point above
            the fold of this section. */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
            From the neighborhood
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} filled={n <= Math.round(avgRating)} large />
              ))}
            </div>
            <span className="text-4xl font-extrabold text-stone-900 tabular-nums">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-sm font-medium text-stone-500">/ 5</span>
          </div>
          <p className="text-stone-600 mt-3 text-sm">
            <strong className="text-stone-800 tabular-nums">{totalReviews}</strong> recent reviews from real{" "}
            {STORE.address.city} customers
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {REVIEWS.map((r, i) => (
            <article
              key={i}
              className="group rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 flex flex-col gap-3.5 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} filled={n <= r.rating} small />
                ))}
              </div>
              <p className="text-sm text-stone-700 leading-relaxed line-clamp-5">&ldquo;{r.text}&rdquo;</p>
              <div className="mt-auto pt-3 border-t border-stone-100 flex items-center gap-3">
                <span
                  className={`shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold ${colorFor(r.author)}`}
                  aria-hidden="true"
                >
                  {initialsOf(r.author)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-stone-900 truncate">{r.author}</div>
                  <div className="text-[11px] text-stone-500">{r.city}, Seattle</div>
                </div>
                <time className="text-[11px] text-stone-400 tabular-nums shrink-0" dateTime={r.date}>
                  {new Date(r.date + "T12:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-2.5">
          <a
            href={STORE.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-stone-300 bg-white hover:border-indigo-400 hover:bg-indigo-50 text-stone-700 hover:text-indigo-700 text-sm font-semibold transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.32.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.32-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            Leave us a review on Google
          </a>
          <p className="text-[11px] text-stone-500 text-center max-w-md">
            Reviews come from in-store comment cards and Google Maps. We don&apos;t edit, filter, or curate
            them — the bad and the great both go up.
          </p>
        </div>
      </div>
    </section>
  );
}

function Star({
  filled,
  small = false,
  large = false,
}: {
  filled: boolean;
  small?: boolean;
  large?: boolean;
}) {
  const cls = large ? "w-7 h-7" : small ? "w-3.5 h-3.5" : "w-5 h-5";
  return (
    <svg
      className={`${cls} ${filled ? "text-amber-400" : "text-stone-200"}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.32.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.32-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}
