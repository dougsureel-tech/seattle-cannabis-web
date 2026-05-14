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
  // OPTIONAL 200-400 word long-form section for higher-SEO-value areas.
  // When present, the /near/<slug> page renders it between whyStop and
  // the CTA — gives Google enough body copy to compete with generic
  // "[neighborhood] dispensary" listings without padding.
  // Voice: same as whyStop, but with room to name landmarks + describe
  // who actually shows up. 4-paragraph shape:
  //   1. drive time + route + parking
  //   2. who shows up + weekly/seasonal patterns
  //   3. cross-traffic + compliance line (cash + ATM + ID + 21+)
  //   4. tenure ("Since 2010, pre-I-502…") + online-order CTA
  // Sister of greenlife-web's NearTown.cityCopy. Constraint: WAC
  // 314-55-155 — no effect/medical/promotional claims. Stay in
  // "experience / who shows up / local vibe" lane. No superlatives
  // about being the closest — Seattle has dozens of dispensaries
  // and those claims are easy to get wrong.
  cityCopy?: string;
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
    cityCopy: [
      "Columbia City to our shop is about 8 minutes — south on Rainier Ave the whole way, no turns, no freeway. From the Columbia City Light Rail station it's a 5-minute roll on the 7 bus or a 10-minute walk if the weather's right. We're at 7266 Rainier Ave S with free parking out front.",
      "Who shows up from Columbia City: regulars on foot in summer, on the bus in winter, and in the car year-round when the trip's part of a longer errand. Wednesday farmers-market afternoons pull a crowd. Theater nights at the Columbia City Theater put another wave through our door. Weekend brunch crews coming up Rainier from Hillman City swing in on the way back.",
      "Columbia City and Rainier Valley share the same arterial — Rainier Ave is the spine of the south end. Most Columbia City regulars pair us with a grocery run at PCC, a stop at the Bourbon Bar, or a sandwich at Geraldine's Counter. Cash only at the counter, ATM in the lobby, ID checked at the door per WAC. 21 and up.",
      "We've been on Rainier Ave S since 2010 — pre-I-502, back when this neighborhood looked different and the door said something else. Order online before you head over and we'll have it pulled and bagged at the counter; the live menu has whatever's on the shelf today. Walk-in works too — that's what the budtenders are here for.",
    ].join("\n\n"),
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
    cityCopy: [
      "Beacon Hill to our door is about 12 minutes — drop down 12th Ave S to the Holgate Bridge, cross over, and pick up Rainier Ave south. On Light Rail it's Beacon Hill Station → Mt Baker → 7 bus south, around 25 minutes end to end. We're at 7266 Rainier Ave S, free parking out front.",
      "Who shows up from Beacon Hill: weeknight commuters coming home from downtown or SODO who pick up on the way past, weekend regulars pairing the trip with a stop at El Centro de la Raza or the Beacon Food Forest, and Filipino-community-center crowd members who already roll through Rainier Valley for groceries. The Light-Rail crowd uses Mt Baker as the transfer point.",
      "Beacon Hill's residential interior doesn't carry a recreational dispensary inside neighborhood lines, so the run south to us is the routine. Most Beacon regulars pair us with a grocery stop at Red Apple or a bite at Bar del Corso. Cash only at the counter, ATM in the lobby, ID checked at the door per WAC. 21 and up.",
      "We've been on Rainier Ave S since 2010 — pre-I-502 in this stretch of the south end. Order online before you head down the hill and we'll have it pulled and bagged at the counter; the live menu has whatever's on the shelf today. Walk in and ask if you'd rather — that's what the budtenders are here for.",
    ].join("\n\n"),
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
    cityCopy: [
      "Rainier Beach to our shop is about 8 minutes — straight up Rainier Ave, no turns, same street the whole way. From Rainier Beach Station it's three stops north on the 7 bus or one stop on Light Rail to Othello + a short walk. Free parking out front at 7266 Rainier Ave S.",
      "Who shows up from Rainier Beach: regulars who walk Pritchard Beach Park on weekends and swing in after, Lake Washington swimmers in summer coming up from the boat ramp, weeknight commuters returning from work in SODO or downtown, and the Rainier Beach Community Center crowd. The light-rail walk-up share has grown every year since the Othello station opened.",
      "Rainier Beach and the rest of Rainier Valley share Rainier Ave as the spine — most of the south end's daily traffic runs this corridor. Cross-traffic from Skyway and Lakeridge passes our door on the way into the city. Cash only at the counter, ATM in the lobby, ID checked at the door per WAC. 21 and up.",
      "We've been on Rainier Ave S since 2010 — pre-I-502, before the south end's current shape. Order online before you head north and we'll have it pulled and bagged at the counter; the live menu has whatever's on the shelf today. Walk-in works too — that's what the budtenders are here for.",
    ].join("\n\n"),
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
    cityCopy: [
      "Skyway to our shop runs about 10 minutes — up Renton Ave S, hang a right onto Rainier, and you're at the door at 7266 Rainier Ave S. Free parking out front. On transit it's the 106 bus from Skyway Park to Rainier Beach Station + the 7 bus north, around 25 minutes door to door.",
      "Who shows up from Skyway: regulars who live up on West Hill and treat Rainier Valley as their grocery + errand neighborhood, weekend cooks heading to PCC or the Columbia City farmers market, Skyway Park morning-walk crowd swinging through on the way home. The drive up Renton Ave is direct enough that the trip rolls into other south-end errands without adding miles.",
      "Skyway is unincorporated King County — sales tax differs from Seattle city limits, and a few things people expect to find inside city lines (recreational cannabis included) sit further in. Most Skyway regulars pair us with a Columbia City or Hillman City stop on the way back. Cash only at the counter, ATM in the lobby, ID checked at the door per WAC. 21 and up.",
      "We've been on Rainier Ave S since 2010 — pre-I-502, before the West Hill stretch had its current shape. Order online before you head down the hill and we'll have it pulled and bagged at the counter; the live menu has whatever's on the shelf today. Walk in and ask if you'd rather — that's what the budtenders are here for.",
    ].join("\n\n"),
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
    cityCopy: [
      "Tukwila to our shop is about 12 minutes — up MLK Jr Way S to Rainier and right to the door, or I-5 north to the Albro exit and east on Swift Ave. Free parking out front at 7266 Rainier Ave S. On transit it's Tukwila International Boulevard Station → Rainier Beach → 7 bus north, around 35 minutes if you're not in a hurry.",
      "Who shows up from Tukwila: regulars who shop at Southcenter and pair the trip with a Seattle-side errand, Foster + Riverton residents who treat Rainier Valley as the next neighborhood north, weeknight commuters dropping off the freeway, and warehouse-shift workers from the SODO + Georgetown corridor heading home. Sounder-train evening crowd swings through occasionally.",
      "Tukwila and Seattle sit on different sales-tax rates — the difference shows up on the receipt — and Tukwila has its own retail south of city limits. Most Tukwila regulars at our shop are pairing us with a Foster + downtown + SODO errand chain rather than treating us as the closest stop. Cash only at the counter, ATM in the lobby, ID checked at the door per WAC. 21 and up.",
      "We've been on Rainier Ave S since 2010 — pre-I-502 in this stretch of south Seattle. Order online before you head up MLK and we'll have it pulled and bagged at the counter; the live menu has whatever's on the shelf today. Walk in and ask if you'd rather — that's what the budtenders are here for.",
    ].join("\n\n"),
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
    cityCopy: [
      "Renton to our door is about 15 minutes — I-405 north to I-5, exit at Albro and east to Rainier, or surface streets up Rainier Ave all the way from the Renton end. Free parking out front at 7266 Rainier Ave S, no parking-meter scramble like you get further into downtown.",
      "Who shows up from Renton: commuters working in SODO + downtown who already roll past our exit twice a day, weekenders pairing us with a Mariners game or a Costco-Sodo-IKEA errand chain, and Highlands + Kennydale residents heading into the city for restaurants on Capitol Hill or the U-District. Boeing-shift workers from the Renton plant rotate through too.",
      "Renton has its own retail inside city limits — we're not advertising ourselves as the closest option. What we are is the next stop along the way for anyone whose day already crosses into Seattle. Most Renton regulars at our shop pair us with a SODO, downtown, or Capitol Hill destination. Cash only at the counter, ATM in the lobby, ID checked at the door per WAC. 21 and up.",
      "We've been on Rainier Ave S since 2010 — pre-I-502, before Rainier Valley had its current shape. Order online before you get on I-405 and we'll have it pulled and bagged at the counter; the live menu has whatever's on the shelf today. Walk in and ask if you'd rather — that's what the budtenders are here for.",
    ].join("\n\n"),
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
  {
    slug: "west-seattle",
    name: "West Seattle",
    driveMins: 25,
    transit: "Water Taxi to downtown + Light Rail south, or West Seattle Bridge → I-5 → MLK",
    pitch: "West Seattle has its own dispensaries; we're the closest legal cannabis east of I-5 if you're heading downtown anyway.",
    whyStop:
      "West Seattle locals making the I-5 + downtown loop pair us with a Beacon Hill or SODO errand. Not the shortest run — but if you're already eastbound, Rainier Valley is on the way home.",
    notableNeighbors: ["SODO", "Georgetown", "Beacon Hill"],
  },
  {
    slug: "capitol-hill",
    name: "Capitol Hill",
    driveMins: 18,
    transit: "Capitol Hill Light Rail → 3 stops south to Mt Baker → 7 bus",
    pitch: "Capitol Hill to Rainier Valley is 18 min — Light Rail or down 23rd Ave South.",
    whyStop:
      "Capitol Hill has its own selection up north; we're the south-side counterpart. Most Capitol Hill regulars at SCC are coming through on a Mt Baker / Columbia City weekend errand. Three stops on Light Rail + a 7-bus transfer.",
    notableNeighbors: ["Central District", "International District", "Mt Baker"],
  },
  {
    slug: "lake-city",
    name: "Lake City",
    driveMins: 25,
    transit: "I-5 south to Albro + east to Rainier, or Northgate Station → Light Rail south",
    pitch: "Lake City to Rainier Valley is 25 min — I-5 straight south, exit at Albro, east to the door.",
    whyStop:
      "Lake City sits at the north end of Seattle; we're at the south end. The run between is I-5 with one exit + a short cross to Rainier. Lake City regulars pair us with a downtown, U-District, or Capitol Hill errand on the way back.",
    notableNeighbors: ["Northgate", "Maple Leaf", "Capitol Hill"],
    cityCopy: [
      "Lake City to our door runs about 25 minutes — I-5 south the whole way, exit at Albro, east to Rainier Ave, and you're at 7266 Rainier Ave S. Free parking out front. Light Rail is the alternative: Northgate Station south, transfer at Westlake or Mt Baker depending on schedule, around 50 minutes end to end on transit.",
      "Who shows up from Lake City: regulars pairing the run with a downtown or U-District errand, weekend crews making a single Seattle trip with us folded in, and Maple Leaf + Pinehurst residents who treat the south end as their adopted second neighborhood for restaurants and shopping. The crowd is reliable but not daily — a 25-minute drive doesn't suit a weeknight habit.",
      "Lake City has its own retail north of Northgate and we're not advertising ourselves as the closest option for in-Lake-City shopping. Most regulars are pairing us with something else — a doctor's appointment in SODO, a friend on Beacon Hill, an evening on Capitol Hill, or a Mariners or Sounders game. Cash only at the counter, ATM in the lobby, ID checked at the door per WAC. 21 and up.",
      "We've been on Rainier Ave S since 2010 — pre-I-502, before the south end had its current shape. Order online before you get on I-5 and we'll have it pulled and bagged at the counter; the live menu has whatever's on the shelf today. Walk in and ask if you'd rather — that's what the budtenders are here for.",
    ].join("\n\n"),
  },
  {
    slug: "central-district",
    name: "Central District",
    driveMins: 12,
    transit: "Down 23rd Ave S to Rainier, or 48 bus",
    pitch: "Central District to Rainier Valley is 12 min — straight down 23rd or the 48 bus.",
    whyStop:
      "Central District + Madrona share 23rd Ave S as the natural artery to us. Direct shot down to Rainier Ave — no freeway needed, no parking-meter scramble at our end.",
    notableNeighbors: ["Capitol Hill", "Mt Baker", "Madrona"],
  },
  {
    slug: "burien",
    name: "Burien",
    driveMins: 25,
    transit: "I-5 + I-405 north + MLK; or 131 bus + transfer",
    pitch: "Burien to Rainier Ave is 25 min via I-5 or surface streets — closest in-Seattle dispensary going north.",
    whyStop:
      "Burien is its own city with its own retail; we're the closest in-Seattle option. Burien regulars coming up for a Sodo, Costco, or downtown trip pair us with the errand chain.",
    notableNeighbors: ["Tukwila", "White Center", "SeaTac"],
    cityCopy: [
      "Burien to our shop is about 15 minutes — east on S 128th, north on I-5, exit at Albro and east to Rainier. The surface-street alternative is 1st Ave S north + cross over at SODO to MLK and down to Rainier. Free parking out front at 7266 Rainier Ave S.",
      "Who shows up from Burien: regulars who shop Westwood Village and pair the trip with a Seattle-side run, SeaTac-airport workers heading home from a shift, weeknight commuters cutting through SODO, and weekend crews catching a Sounders or Mariners game who swing in on the way back south. Three Tree Point and Five Corners residents make the trip when they're crossing the city anyway.",
      "Burien has Town Square retail inside city limits and we're not the closest option for in-Burien shopping. What we are is the next stop along the way for anyone whose day already runs into Seattle. Burien Park and Lake Burien residents who treat Rainier Valley as their adopted second neighborhood are the regular share. Cash only at the counter, ATM in the lobby, ID checked at the door per WAC. 21 and up.",
      "We've been on Rainier Ave S since 2010 — pre-I-502, before the south end had its current shape. Order online before you cross into Seattle and we'll have it pulled and bagged at the counter; the live menu has whatever's on the shelf today. Walk in and ask if you'd rather — that's what the budtenders are here for.",
    ].join("\n\n"),
  },
  {
    slug: "mercer-island",
    name: "Mercer Island",
    driveMins: 18,
    transit: "I-90 west + I-5 south + MLK, or Mercer Island Light Rail (East Link)",
    pitch: "Mercer Island to Rainier Valley is 18 min via I-90 + south on Rainier.",
    whyStop:
      "Mercer Island is dry — no recreational dispensary on the island. Closest in-Seattle option is us, 18 min via I-90. Pair with a downtown errand on the way back.",
    notableNeighbors: ["Bellevue", "Mt Baker", "International District"],
  },
  {
    slug: "white-center",
    name: "White Center",
    driveMins: 20,
    transit: "120 bus across to Rainier Valley, or up MLK from West Seattle",
    pitch: "White Center to Rainier Valley is 20 min — across the city, same south-end vibe.",
    whyStop:
      "White Center has its own retail south of city limits; we're the closest in-Seattle option going east. Locals pairing a downtown or SODO errand with the run home stop in. Cash only at the till; ATM in-store.",
    notableNeighbors: ["Burien", "West Seattle", "Tukwila"],
    cityCopy: [
      "White Center to our door is about 12 minutes — east on Roxbury, up MLK Jr Way S, and east to Rainier Ave. The freeway path is 1st Ave S north + I-5 + Albro exit; surface streets are usually faster. Free parking out front at 7266 Rainier Ave S.",
      "Who shows up from White Center: regulars treating the run across to Rainier Valley as a routine south-end errand, weekend cooks pairing us with a stop at Boon Boona or Salvadorean Bakery on the way back, and the 120-bus crowd who cross over for restaurants on MLK. The unincorporated-King-County edge of White Center pulls a slightly different rotation than the in-Seattle stretch.",
      "White Center has its own retail south of city limits — same south-end vibe, different cluster. Our share of the White Center crowd is mostly errand-pair traffic: a downtown stop, a SODO appointment, or a Beacon Hill grocery run with us folded in. Cash only at the counter, ATM in the lobby, ID checked at the door per WAC. 21 and up.",
      "We've been on Rainier Ave S since 2010 — pre-I-502, before the south end's current shape. Order online before you head east and we'll have it pulled and bagged at the counter; the live menu has whatever's on the shelf today. Walk in and ask if you'd rather — that's what the budtenders are here for.",
    ].join("\n\n"),
  },
  {
    slug: "seatac",
    name: "SeaTac",
    driveMins: 22,
    transit: "SeaTac/Airport Light Rail → 5 stops north to Mt Baker → 7 bus south",
    pitch: "SeaTac to Rainier Valley is 22 min — flight-out errand or pick-up-on-the-way-home.",
    whyStop:
      "SeaTac airport-area customers pair us with a flight or a hotel stay. Light Rail is the easy path: Airport Station → Mt Baker → 7 bus south, or just up I-5 to MLK and over to Rainier.",
    notableNeighbors: ["Tukwila", "Burien", "Federal Way"],
    cityCopy: [
      "SeaTac to our shop is about 15 minutes — I-5 north, exit at Albro and east, or 99 + Boeing Access Rd if traffic's wrong on the freeway. Free parking out front at 7266 Rainier Ave S. On transit it's SeaTac/Airport Station → Mt Baker → 7 bus south, around 40 minutes door to door — a real option when you don't want to mess with airport parking.",
      "Who shows up from SeaTac: airport-area hotel guests pre-flight or post-flight, ground-crew and airline-shift workers from the SeaTac side, and locals who live in the residential pockets between the airport and Tukwila. Pre-flight pickups are a regular pattern — order ahead, swing in, then back to I-5 or back to Light Rail.",
      "SeaTac sits south of the city sales-tax line and has its own retail close to the airport corridor. Most SeaTac regulars at our shop are pairing the trip with a Seattle-side errand — a SODO appointment, a downtown stop, or a flight. Cash only at the counter, ATM in the lobby, ID checked at the door per WAC. 21 and up. (Reminder: you can't bring cannabis through TSA — the trip needs to be local.)",
      "We've been on Rainier Ave S since 2010 — pre-I-502, before the south-end light-rail line opened. Order online before you leave the airport corridor and we'll have it pulled and bagged at the counter; the live menu has whatever's on the shelf today. Walk in and ask if you'd rather — that's what the budtenders are here for.",
    ].join("\n\n"),
  },
  {
    slug: "federal-way",
    name: "Federal Way",
    driveMins: 30,
    transit: "I-5 north + MLK, or Federal Way Light Rail (Sounder corridor) → transfer",
    pitch: "Federal Way to Rainier Valley is 30 min north on I-5 — closest in-Seattle dispensary going up.",
    whyStop:
      "Federal Way is its own city with retail; we're the closest in-Seattle option going north. Federal Way regulars at SCC pair us with a downtown / SODO / Mariners-or-Sounders-game errand chain. Free parking at our end (no meter scramble).",
    notableNeighbors: ["SeaTac", "Tukwila", "Burien"],
  },
  {
    slug: "bellevue",
    name: "Bellevue",
    driveMins: 22,
    transit: "I-90 west + I-5 south + MLK, or Bellevue Light Rail (East Link) when running",
    pitch: "Bellevue to Rainier Valley is 22 min via I-90 — quick across the bridge + south.",
    whyStop:
      "Bellevue has limited recreational retail; many Bellevue regulars cross I-90 for a Seattle-side run. We're a 22-min I-90 + Rainier Ave shot. Pair with a downtown stop or a Mercer Island detour.",
    notableNeighbors: ["Mercer Island", "Mt Baker", "Capitol Hill"],
  },
];

export function getTown(slug: string): NearArea | null {
  const match = NEAR_TOWNS.find((t) => t.slug === slug);
  return match ?? null;
}
