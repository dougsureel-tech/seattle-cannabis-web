// Service-area landing-page data for /near/<area>.
//
// Seattle's geography is different from a small-town store — Rainier
// Valley + adjacent neighborhoods are within Seattle proper, not
// separate towns. Each entry is a NEIGHBORHOOD with a real-resident-
// view of the drive/walk/bus to 7266 Rainier Ave S.
//
// Voice: hyperlocal — same warmth as /home + /visit + /press; mentions
// actual streets, transit lines, landmarks a Rainier Valley resident
// would recognize. NOT generic SEO filler.

export type NearArea = {
  slug: string;
  name: string;
  driveMins: number;
  transit: string;       // Bus/light-rail directions
  pitch: string;         // 1-sentence local hook
  whyStop: string;       // 2-3 sentences
  notableNeighbors: string[];
};

export const NEAR_TOWNS: readonly NearArea[] = [
  {
    slug: "rainier-valley",
    name: "Rainier Valley",
    driveMins: 5,
    transit: "On the 7 bus line · 5 min from Othello + Columbia City Light Rail",
    pitch: "We're on Rainier Ave S in the heart of Rainier Valley — the neighborhood shop, not a chain.",
    whyStop:
      "Rainier Valley is our neighborhood. Most of our staff lives within 10 minutes of the door. If you're picking up groceries at PCC or Lam's, grabbing dim sum on MLK, or coming back from Seward Park — we're on the way home. Cash only at the till; ATM in-store.",
    notableNeighbors: ["Columbia City", "Hillman City", "Seward Park"],
  },
  {
    slug: "columbia-city",
    name: "Columbia City",
    driveMins: 8,
    transit: "Columbia City Light Rail → 5 min south on 7 bus, or 10 min walk down Rainier",
    pitch: "Columbia City to us is one Light-Rail stop south + a 5-min walk — the closest dispensary to the station.",
    whyStop:
      "Columbia City is the food + farmers-market hub; we're a few minutes south on Rainier. Pair with the Wednesday farmers market or after a walk down to the Columbia City Theater. The 7 bus runs every 15 min in either direction.",
    notableNeighbors: ["Hillman City", "Mt Baker", "Rainier Valley"],
  },
  {
    slug: "seward-park",
    name: "Seward Park",
    driveMins: 7,
    transit: "Walk-friendly from S Genesee or up Wilson Ave",
    pitch: "Seward Park to Rainier Ave is a 7-min drive — the closest dispensary to the loop.",
    whyStop:
      "Seward Park residents walk or bike here regularly — we're the closest legal dispensary to the peninsula. After a Lake-Washington loop or a stop at Third Place Books, come straight up to Rainier. Free parking out front.",
    notableNeighbors: ["Rainier Valley", "Mt Baker", "Lakewood-Seward Park"],
  },
  {
    slug: "beacon-hill",
    name: "Beacon Hill",
    driveMins: 12,
    transit: "Beacon Hill Light Rail → SODO transfer or Mt Baker → 7 bus south",
    pitch: "Beacon Hill to Rainier Valley is a 12-min drive over the Holgate Bridge or a Light-Rail hop.",
    whyStop:
      "Beacon Hill doesn't have a recreational dispensary inside the neighborhood; we're the closest one south. The 36 bus down Beacon Ave + a transfer to the 7 gets you here in 25 min, or just drop down 12th Ave S and right onto Rainier.",
    notableNeighbors: ["Mt Baker", "International District", "Georgetown"],
  },
  {
    slug: "mt-baker",
    name: "Mt Baker",
    driveMins: 10,
    transit: "Mt Baker Light Rail → south on 7 bus, or down Rainier directly",
    pitch: "Mt Baker → Rainier Valley is 10 min south on Rainier — through Hillman City and you're at our door.",
    whyStop:
      "Mt Baker is a quick south-on-Rainier drive — we're past Franklin High School and Hillman City. Mt Baker locals coming home from work in SODO or downtown swing through on the way home.",
    notableNeighbors: ["Beacon Hill", "Columbia City", "Rainier Valley"],
  },
  {
    slug: "othello",
    name: "Othello",
    driveMins: 5,
    transit: "Othello Light Rail → 5 min north on 7 bus or 10-min walk along Rainier",
    pitch: "Othello to us is a 5-min walk up Rainier or one stop north on Light Rail.",
    whyStop:
      "Othello is right next door — we're the closest dispensary to the station. Worth it just for the walk along Rainier on a sunny day, or roll the 7 bus three stops north and you're here.",
    notableNeighbors: ["Rainier Beach", "Rainier Valley", "Hillman City"],
  },
  {
    slug: "hillman-city",
    name: "Hillman City",
    driveMins: 4,
    transit: "Walk along Rainier Ave or 7 bus south",
    pitch: "Hillman City and Rainier Valley share Rainier Ave — we're 4 minutes south.",
    whyStop:
      "Hillman City is the next neighborhood up Rainier from us. Tutta Bella, Big Chickie, and us — the trio of stops on the south end of the city. Walk it on a nice day.",
    notableNeighbors: ["Columbia City", "Rainier Valley", "Seward Park"],
  },
  {
    slug: "rainier-beach",
    name: "Rainier Beach",
    driveMins: 8,
    transit: "Rainier Beach Light Rail → 7 bus north, or straight up Rainier Ave",
    pitch: "Rainier Beach to us is 8 min straight up Rainier — same street, two neighborhoods.",
    whyStop:
      "Rainier Beach to 7266 Rainier Ave S is a one-shot drive — same arterial, no turns. Closest legal dispensary north of Rainier Beach inside Seattle city limits.",
    notableNeighbors: ["Othello", "Skyway", "Rainier Valley"],
  },
  {
    slug: "skyway",
    name: "Skyway",
    driveMins: 10,
    transit: "106 bus from Rainier Beach Light Rail, or up Renton Ave S into Rainier Valley",
    pitch: "Skyway to Rainier Valley is 10 min — closest in-Seattle dispensary to West Hill.",
    whyStop:
      "Skyway sits unincorporated between Seattle and Renton; the closest legal dispensary inside Seattle is us. Most Skyway regulars come up Renton Ave S into Rainier Valley. The 106 bus + a short walk works too.",
    notableNeighbors: ["Rainier Beach", "Renton", "Rainier Valley"],
  },
  {
    slug: "tukwila",
    name: "Tukwila",
    driveMins: 15,
    transit: "Tukwila Light Rail or 124 bus",
    pitch: "Tukwila to Rainier Ave is 15 min north — closest in-Seattle dispensary if you're south of the city line.",
    whyStop:
      "Tukwila is a county-island catchment — different city, different sales-tax rate (Tukwila vs Seattle), but a short drive. We're a 15-min run up MLK or via I-5 + Rainier Ave. Customers from Southcenter and Foster pair us with a Seattle errand.",
    notableNeighbors: ["Skyway", "Renton", "Rainier Beach"],
  },
  {
    slug: "renton",
    name: "Renton",
    driveMins: 20,
    transit: "I-405 to MLK + Rainier",
    pitch: "Renton to Rainier Valley is a 20-min I-405 + MLK shot — pair us with a downtown-Seattle errand.",
    whyStop:
      "Renton has its own dispensaries; we're not the closest, but we ARE the closest one inside Seattle city limits. Renton residents commuting north for work or weekend trips pair us with the Costco / IKEA / SODO run. Free parking, no parking-meter scramble.",
    notableNeighbors: ["Tukwila", "Skyway", "Rainier Beach"],
  },
  {
    slug: "georgetown",
    name: "Georgetown",
    driveMins: 12,
    transit: "60 bus from Beacon Hill, or down Airport Way + I-5 to MLK",
    pitch: "Georgetown to Rainier Valley is 12 min — across the I-5 corridor.",
    whyStop:
      "Georgetown is its own world south of SODO. Closest legal dispensary east of the freeway is us. Pair with a Boeing-Field-side coffee stop or a Stumbling Monk after.",
    notableNeighbors: ["Beacon Hill", "SODO", "International District"],
  },
  {
    slug: "international-district",
    name: "International District",
    driveMins: 15,
    transit: "ID/Chinatown Light Rail → 7 bus south to Rainier Valley",
    pitch: "ID/Chinatown to Rainier Ave is 15 min — Light Rail or south on Rainier.",
    whyStop:
      "Chinatown-International District residents and downtown workers pair us with a south-end errand or commute home. Light Rail to Mt Baker + a 7-bus transfer south, or just Rainier Ave the whole way.",
    notableNeighbors: ["Beacon Hill", "Mt Baker", "SODO"],
  },
];

export function getTown(slug: string): NearArea | null {
  const match = NEAR_TOWNS.find((t) => t.slug === slug);
  return match ?? null;
}
