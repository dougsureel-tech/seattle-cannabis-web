import type { WrappedRecap } from "@/lib/wrapped";
import {
  formatVarietyBrag,
  formatFamilyBrag,
  formatTerpeneBrag,
  formatLoyaltyBrag,
} from "@/lib/wrapped";

// In-page Wrapped panel — Server Component, renders the same set of
// stat tiles that the `/api/wrapped/share-card` PNG render uses, but
// styled for screen display (responsive, hover-states, etc.).
//
// SCC palette: indigo · violet · fuchsia (Rainier Valley night-sky).
// GLW sister: emerald · lime · stone (Wenatchee orchard-green).

type Props = {
  recap: WrappedRecap;
  storeName: string;
};

export function WrappedShareCard({ recap, storeName }: Props) {
  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-indigo-200/60 bg-gradient-to-br from-indigo-950 via-indigo-900 to-fuchsia-900 p-8 text-white shadow-2xl sm:p-12"
      aria-label="Year-in-Strains recap"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 20%, rgba(129,140,248,0.25), transparent 60%), radial-gradient(circle at 15% 90%, rgba(232,121,249,0.18), transparent 55%)",
        }}
      />

      <header className="relative">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200">
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full bg-indigo-300 shadow-[0_0_12px_rgba(165,180,252,0.7)]"
          />
          <span>{storeName}</span>
          <span aria-hidden="true" className="text-indigo-400">
            ·
          </span>
          <span>Year {recap.year} in Strains</span>
        </div>
        <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">
          {recap.customerName},
          <br />
          here is your year on the shelf.
        </h2>
        <p className="mt-4 max-w-2xl text-base text-indigo-100/90 sm:text-lg">
          {recap.heroBlurb}
        </p>
      </header>

      <div className="relative mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatTile
          eyebrow="Top strains"
          lines={recap.topStrains.slice(0, 3).map((s) => `${s.name} · ${s.visits} visits`)}
        />
        <StatTile eyebrow="Family" lines={[formatFamilyBrag(recap)]} />
        <StatTile eyebrow="Aroma palette" lines={[formatTerpeneBrag(recap)]} />
        <StatTile eyebrow="Variety" lines={[formatVarietyBrag(recap)]} />
        <StatTile
          eyebrow="The strain you came back to"
          lines={[formatLoyaltyBrag(recap)]}
        />
        <StatTile
          eyebrow="Year in numbers"
          lines={[
            `${recap.totalPurchases} visits this year`,
            `${recap.totalStrainsTried} strains tried`,
          ]}
        />
      </div>

      <footer className="relative mt-10 flex flex-wrap items-end justify-between gap-4 text-sm text-indigo-200/90">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-indigo-300">
            ✦
          </span>
          <span>Receipt-verified · {storeName}</span>
        </div>
        <div className="text-indigo-100/80">
          Built from your year on the shelf.
        </div>
      </footer>
    </section>
  );
}

function StatTile({
  eyebrow,
  lines,
}: {
  eyebrow: string;
  lines: string[];
}) {
  return (
    <div className="relative rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-200">
        {eyebrow}
      </div>
      <div className="mt-2 space-y-1 text-base font-semibold leading-snug text-white">
        {lines.map((line, idx) => (
          <div key={`${eyebrow}-${idx}`}>{line}</div>
        ))}
      </div>
    </div>
  );
}
