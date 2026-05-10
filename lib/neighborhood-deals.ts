import type { Neighborhood } from "./neighborhoods";

// v1 static fallback for "deal of the day, by neighborhood" rendered on the
// homepage interactive map popover. Keyed by neighborhood id.
//
// DB-backed v2 (when Doug's ready):
//   ALTER TABLE deals ADD COLUMN neighborhood TEXT NULL;
//   -- one of: 'rainier-valley' | 'seward-park' | 'columbia-city'
//   --        | 'beacon-hill' | 'mount-baker' | 'othello'
//   --        | 'hillman-city' | 'rainier-beach' | NULL (any/all)
// Then `getActiveDeals()` in lib/db.ts gets a `neighborhood` field and
// the homepage maps neighborhood id → dealsForNeighborhood[]. Until that
// migration ships, this static map is the source of truth and the homepage
// falls back to the global top deal if a neighborhood isn't represented here.
//
// Editorial discipline: each line is one short call-to-action a budtender
// would actually say. No exclamation marks, no "WHILE SUPPLIES LAST" yelling,
// no compliance disclaimer copy — that's not what these are. The map popover
// is geo-targeted brand voice, full stop.

export type NeighborhoodDeal = {
  /** Short label rendered as a chip — keep under ~24 chars. */
  short: string;
  /** One-line context shown beneath the chip in the popover. */
  detail: string;
};

export const NEIGHBORHOOD_DEALS: Record<Neighborhood["id"], NeighborhoodDeal | null> = {
  "rainier-valley": {
    short: "Local 10% — show ZIP 98118",
    detail: "Anyone with a 98118 / 98144 ID gets a Rainier Valley local rate at the counter.",
  },
  "seward-park": {
    short: "Lakeside pre-roll bundle",
    detail: "Walk to the water with a 3-pack. Our budtenders rotate the picks weekly.",
  },
  "columbia-city": {
    short: "One-stop edibles run",
    detail: "Off the Link at Othello — our edibles wall is one stop south of yours.",
  },
  "beacon-hill": {
    short: "Beacon Hill neighbors — 10%",
    detail: "Beacon Hill walk-ins — show local ID, save at the counter. (Veterans + first responders: see Heroes program for 30%.)",
  },
  "mount-baker": {
    short: "Lake-day vape special",
    detail: "Concentrates and AIOs that travel. Stays sealed in the car on the way over.",
  },
  // Othello is the shop neighborhood — no deal-of-the-day; the popover
  // shows the global top deal as fallback so locals still see something.
  othello: null,
  "hillman-city": {
    short: "Walk-up flower of the week",
    detail: "A staff-pick eighth ten minutes up Rainier — ask the budtender on shift.",
  },
  "rainier-beach": {
    short: "South-end neighbor 10%",
    detail: "98118 / 98178 IDs get a counter-side discount on flower and pre-rolls.",
  },
};

/** Returns the static neighborhood-tagged deal, or null to fall back to global. */
export function dealForNeighborhood(id: string): NeighborhoodDeal | null {
  return NEIGHBORHOOD_DEALS[id] ?? null;
}
