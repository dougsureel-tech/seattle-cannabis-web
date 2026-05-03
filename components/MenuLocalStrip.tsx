import Link from "next/link";
import { STORE } from "@/lib/store";
import { withAttr } from "@/lib/attribution";

// Compact "Serving Rainier Valley + South Seattle" strip — drops in
// below the /menu Boost embed so the geo-cohort signal that drives the
// homepage hero is also visible to customers who deep-link straight to
// /menu.
//
// Doug 2026-05-02: ties the front page and /menu so they flow as one
// brand surface, not "homepage marketing → third-party embed cliff".
//
// Pulls from `STORE.nearbyNeighborhoods` — the same array that drives:
//   - homepage hero pill cluster
//   - LocalBusiness areaServed JSON-LD (root layout.tsx)
//   - NeighborhoodMap.tsx pin set
// One source of truth across all surfaces.
//
// Indigo palette (Seattle's identity), keeps the visual register calm.

export function MenuLocalStrip() {
  return (
    <section
      aria-labelledby="menu-local-heading"
      className="bg-white border-y border-stone-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-9">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-700">
              Serving {STORE.neighborhood}
            </p>
            <h2
              id="menu-local-heading"
              className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight"
            >
              Pickup is fastest from anywhere in South Seattle.
            </h2>
            <p className="text-sm text-stone-600 max-w-2xl leading-relaxed">
              Order ahead, swing by {STORE.address.full}, hand the budtender
              your name + ID. Cash only. Mt Baker and Columbia City Link
              stations are a short walk away — the 7 bus stops out front.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:max-w-md lg:justify-end">
            {STORE.nearbyNeighborhoods.map((n) => (
              <span
                key={n}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-700"
              >
                {n}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
          <Link
            href={withAttr("/visit", "menu", "local-strip-visit")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white font-semibold transition-colors"
          >
            See address + parking
          </Link>
          <a
            href={STORE.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-indigo-300 hover:bg-indigo-50 text-stone-700 hover:text-indigo-800 font-semibold transition-all"
          >
            Open in Google Maps ↗
          </a>
          <span className="text-stone-500">
            Open daily · Cash only · 21+ with valid ID
          </span>
        </div>
      </div>
    </section>
  );
}
