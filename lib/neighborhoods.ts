// South-Seattle neighborhood directory powering the homepage interactive map +
// the deal-of-the-day surface. Approximate geometry only — the SVG map at
// `components/NeighborhoodMap.tsx` is a stylized recognizable layout, not a
// USGS reprojection. Coordinates are normalized to a 0–100 viewBox so the map
// scales cleanly at any size. The shop pin sits at (50, 56) on Rainier Ave S
// near Othello, with neighborhoods placed roughly to compass-relative N/S
// and Lake Washington / I-5 framing the east + west edges of the canvas.
//
// Drive/walk/transit estimates are conservative wall-clock numbers from
// 7266 Rainier Ave S — these are the kind of figures a customer would see
// scrolling Google Maps mid-day, not theoretical bests. They don't update;
// the goal is "is this close?" not "live ETA."
//
// Every neighborhood has a Google Maps deep-link origin string ready for
// `https://www.google.com/maps/dir/?api=1&origin=...&destination=...` so the
// popover CTA can hand the user off to their preferred mapping app.

export type Neighborhood = {
  id: string; // kebab slug — used as data-neighborhood attr + storage key
  name: string;
  /** SVG coordinate on the 0–100 stylized map. */
  pos: { x: number; y: number };
  /** Driving wall-clock from 7266 Rainier Ave S. */
  driveMin: number;
  /** Walking time when reasonable (under ~25 min); null when not walkable. */
  walkMin: number | null;
  /** One-line transit description (Light Rail, bus, "5 min walk", etc.). */
  transit: string;
  /** Short neighborhood vibe blurb — ~10–15 words, neighborhood-anchored. */
  blurb: string;
  /** Origin string for Google Maps directions URLs. URL-encoded at build site. */
  mapsOrigin: string;
};

export const SHOP_PIN = { x: 50, y: 56 } as const;

// Layout logic: north = top of canvas. Beacon Hill is the northwest crown,
// Mount Baker slightly east of it, Columbia City just N of the shop, Othello
// is the shop's neighborhood (closest), Hillman City just S, Rainier Beach
// further S, Seward Park east on the lake, Rainier Valley as the spine
// label sitting NW of the shop. Light Rail roughly traces y-axis through
// Mt Baker → Othello → Rainier Beach (x ≈ 48-52).
export const NEIGHBORHOODS: readonly Neighborhood[] = [
  {
    id: "rainier-valley",
    name: "Rainier Valley",
    pos: { x: 38, y: 38 },
    driveMin: 4,
    walkMin: 18,
    transit: "10 min on bus 7 down Rainier Ave S",
    blurb: "Our backyard. Rainier Ave S is the spine and we're right on it.",
    mapsOrigin: "Rainier Valley, Seattle, WA",
  },
  {
    id: "seward-park",
    name: "Seward Park",
    pos: { x: 75, y: 50 },
    driveMin: 5,
    walkMin: 22,
    transit: "Bus 50 from Othello Station, 8 min",
    blurb: "Lake-loop walks and the peninsula. Five min east, off Wilson Ave.",
    mapsOrigin: "Seward Park, Seattle, WA",
  },
  {
    id: "columbia-city",
    name: "Columbia City",
    pos: { x: 42, y: 25 },
    driveMin: 7,
    walkMin: null,
    transit: "1 stop south on Link Light Rail, 4 min",
    blurb: "Columbia City Station is one stop north of us on the Link.",
    mapsOrigin: "Columbia City, Seattle, WA",
  },
  {
    id: "beacon-hill",
    name: "Beacon Hill",
    pos: { x: 22, y: 18 },
    driveMin: 9,
    walkMin: null,
    transit: "Link Light Rail to Othello, then 5 min walk",
    blurb: "Up the hill on the north side. The Link drops you straight to us.",
    mapsOrigin: "Beacon Hill, Seattle, WA",
  },
  {
    id: "mount-baker",
    name: "Mount Baker",
    pos: { x: 55, y: 22 },
    driveMin: 6,
    walkMin: null,
    transit: "Link from Mt Baker Station, 6 min",
    blurb: "North of us on the lake side. Mt Baker Station is the easy connect.",
    mapsOrigin: "Mount Baker, Seattle, WA",
  },
  {
    id: "othello",
    name: "Othello",
    pos: { x: 50, y: 50 },
    driveMin: 1,
    walkMin: 5,
    transit: "5 min walk from Othello Light Rail Station",
    blurb: "Othello Station is the closest stop — we're the closest shop to it.",
    mapsOrigin: "Othello Station, Seattle, WA",
  },
  {
    id: "hillman-city",
    name: "Hillman City",
    pos: { x: 45, y: 60 },
    driveMin: 3,
    walkMin: 14,
    transit: "Bus 7 north on Rainier, 6 min",
    blurb: "Couple blocks north on Rainier. Walkable when the weather's right.",
    mapsOrigin: "Hillman City, Seattle, WA",
  },
  {
    id: "rainier-beach",
    name: "Rainier Beach",
    pos: { x: 55, y: 80 },
    driveMin: 5,
    walkMin: null,
    transit: "1 stop north on Link from Rainier Beach Station, 4 min",
    blurb: "South of us. Rainier Beach Station to Othello is a single Link stop.",
    mapsOrigin: "Rainier Beach, Seattle, WA",
  },
] as const;

export function neighborhoodById(id: string): Neighborhood | undefined {
  return NEIGHBORHOODS.find((n) => n.id === id);
}

/** Build a Google Maps directions URL from a neighborhood to the shop. */
export function directionsUrl(n: Neighborhood, destination: string): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    n.mapsOrigin,
  )}&destination=${encodeURIComponent(destination)}`;
}
