import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { safeJsonLd } from "@/lib/json-ld-safe";

// Mirror of the Wenatchee /community page for Seattle Cannabis Co. SCC
// doesn't yet have a `lib/team.ts` analog with named alumni, so the
// Featured Alumni section reads as "coming soon — past staff: get in
// touch" rather than rendering a roster. Otherwise structurally identical
// to the Wenatchee page so the cross-store experience is parallel.
//
// Next iteration: build a `seattle-cannabis-web/lib/team.ts` with SCC's
// real past staff so this page can render their roster too. Doug provides
// names + bios; agent populates the file.

export const metadata: Metadata = {
  title: "Our Community — People & Partners",
  description: `The folks who built and continue to build ${STORE.name}. Past staff, future partners. We're growing the community over time.`,
  alternates: { canonical: "/community" },
  openGraph: {
    title: `Our Community · ${STORE.name}`,
    description: `Past staff, future partners. The community we're building, on purpose.`,
    url: `${STORE.website}/community`,
  },
};

// BreadcrumbList — earns SERP path rendering (Home › Community).
// Closes the 13/14 → 14/14 BreadcrumbList coverage on customer-facing
// pages. Sister of glw v7.405-suite.
const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
    { "@type": "ListItem", position: 2, name: "Community", item: `${STORE.website}/community` },
  ],
};

export default function CommunityPage() {
  return (
    <main className="min-h-[80vh] bg-stone-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
      {/* Hero — indigo/violet gradient mirroring the homepage hero. */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-violet-950 to-indigo-950 text-white">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 80% 50%, rgba(167,139,250,0.25), transparent), radial-gradient(ellipse 50% 60% at 15% 100%, rgba(232,121,249,0.10), transparent)",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <p className="text-indigo-300 text-xs font-bold uppercase tracking-[0.18em] mb-3">
            Our Community
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Built by everyone we&apos;ve worked with.
          </h1>
          <p className="text-indigo-100/80 mt-4 text-base sm:text-lg leading-relaxed max-w-2xl">
            The people who shaped this shop, the people who still send customers our way, and — soon —
            the partners we&apos;re bringing into the fold. Cannabis advertising is restricted by state
            law. Word of mouth is the channel that&apos;s left, and we&apos;re going to do it right.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16 sm:space-y-20">
        {/* Featured alumni — placeholder until SCC team.ts exists */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
              Featured · Alumni
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              The crew that built our reputation.
            </h2>
            <p className="text-stone-500 text-sm mt-2 max-w-xl">
              Sixteen years of standout staff. We&apos;re building the public roster — past staff,
              get in touch and we&apos;ll set you up.
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-stone-200 p-6 sm:p-8 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-stone-700 leading-relaxed">
                Past Seattle Cannabis Co. staff — drop us a line at{" "}
                <a
                  href={`mailto:${STORE.email}?subject=${encodeURIComponent("Past staff — alumni signup")}`}
                  className="font-semibold text-indigo-700 hover:underline"
                >
                  {STORE.email}
                </a>{" "}
                and we&apos;ll add you to the roster + send you a code to share with people you send
                our way.
              </p>
              <p className="text-stone-500 text-sm leading-relaxed mt-2">
                Self-serve signup is coming next — for now it&apos;s a quick email exchange.
              </p>
            </div>
          </div>
        </section>

        {/* Coming soon — Featured Creators */}
        <section className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-fuchsia-700">
              Coming soon · Featured creators
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              Cannabis writers, tasters, and creators we trust.
            </h2>
          </div>
          <div className="rounded-2xl bg-white border border-stone-200 p-6 sm:p-8">
            <p className="text-stone-700 leading-relaxed">
              We&apos;re building a small program for Seattle-based cannabis creators — small
              followings, real audiences, no spam. They get a tracked link to share, a code their
              followers can use, and we get word-of-mouth that doesn&apos;t violate state advertising
              law.
            </p>
            <p className="text-stone-500 text-sm leading-relaxed mt-3">
              If that sounds like you, email{" "}
              <a
                href={`mailto:${STORE.email}?subject=${encodeURIComponent("Featured creator — interested")}`}
                className="text-indigo-700 font-semibold hover:text-indigo-600 underline underline-offset-2"
              >
                {STORE.email}
              </a>{" "}
              with your handle, location, and a recent post you&apos;re proud of. We&apos;re vetting
              the first cohort over the next few weeks.
            </p>
          </div>
        </section>

        {/* Coming soon — Featured Rainier Valley businesses */}
        <section className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-fuchsia-700">
              Coming soon · Featured local businesses
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              Rainier Valley businesses we partner with.
            </h2>
          </div>
          <div className="rounded-2xl bg-white border border-stone-200 p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <p className="text-stone-700 leading-relaxed">
                Local restaurants, bars, music venues, shops — places we like, run by people we know.
                Your employees get a code; we cross-promote you on our deal mailer and at the
                counter.
              </p>
            </div>
            <div>
              <p className="text-stone-500 text-sm leading-relaxed">
                Interested? Email{" "}
                <a
                  href={`mailto:${STORE.email}?subject=${encodeURIComponent("Featured local business — interested")}`}
                  className="text-indigo-700 font-semibold hover:text-indigo-600 underline underline-offset-2"
                >
                  {STORE.email}
                </a>
                . We&apos;re starting with three or four neighbors this summer to make sure the
                mechanics are right before we open it up.
              </p>
            </div>
          </div>
        </section>

        {/* Why we're doing this */}
        <section className="rounded-3xl bg-gradient-to-br from-indigo-950 via-violet-950 to-indigo-950 text-white p-8 sm:p-10 space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">
            Why we&apos;re building this
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Cannabis advertising is restricted. Real connections aren&apos;t.
          </h2>
          <p className="text-indigo-100/80 leading-relaxed max-w-2xl">
            Washington state limits where and how we can advertise (WAC 314-55-155). The most honest
            growth channel left to us is the people who already love what we do telling the people
            who haven&apos;t found us yet. We&apos;re building this on purpose, slowly, with the
            people we already trust.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={`mailto:${STORE.email}?subject=Interested%20in%20being%20featured`}
              className="px-4 py-2 rounded-xl bg-fuchsia-400 hover:bg-fuchsia-300 text-indigo-950 text-sm font-bold transition-colors"
            >
              Email us about being featured
            </a>
            <Link
              href="/about"
              className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white text-sm font-semibold transition-all"
            >
              About SCC →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
