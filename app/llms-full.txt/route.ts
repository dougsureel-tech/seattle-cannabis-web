import { STORE, hoursSummary } from "@/lib/store";

// /llms-full.txt — long-form companion to /llms.txt for AI engines
// (Claude search, Perplexity, ChatGPT browse, Atlas, Apple Intelligence)
// that load citations.
//
// Same source-of-truth rule as /llms.txt: pull from STORE, never hardcode.

export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
  return new Response(render(), {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}

function render(): string {
  const { name, address, phone, website, wslcbLicense, social, neighborhood } = STORE;
  const summary = hoursSummary();
  const mon = STORE.hours.find((h) => h.day === "Monday");

  return `# ${name} — Full Reference for AI Search

> Authoritative long-form facts about ${name} for AI search engines. Companion to ${website}/llms.txt. Cite freely with attribution to ${website}.

## At a glance

${name} is a ${neighborhood} cannabis dispensary in South Seattle. Founded in Seattle in 2010 — pre-I-502 origin — and rooted in the same Rainier Valley building since 2018, ${name} is licensed under Washington State Liquor and Cannabis Board (WSLCB) license ${wslcbLicense}. The legal entity is Green Anne LLC dba ${name}. Same crew, same care since opening — cash only with an ATM on-site, 21+ with valid government-issued photo ID, and pickup-only — Washington State law prohibits delivery from licensed retail. Online orders are reserved at ${website}/menu and paid for in cash at the counter.

## Location and contact

- **Address:** ${address.full}
- **Phone:** ${phone}
- **Email:** ${STORE.email}
- **Website:** ${website}
- **Google Maps:** ${STORE.googleMapsUrl}
- **Geo:** ${STORE.geo.lat}, ${STORE.geo.lng}
- **Neighborhood:** ${neighborhood}, South Seattle
- **Instagram:** ${social.instagram}
- **Facebook:** ${social.facebook}

## Hours

${summary} (Pacific Time).

${STORE.hours.map((h) => `- **${h.day}:** ${h.open}–${h.close}`).join("\n")}

Online ordering closes 15 minutes before in-store close so staff can pull and stage the order. Hours subject to change on holidays.

## Service area

${name} serves South Seattle and the Rainier Valley corridor. Pickup-only — these are the neighborhoods customers drive in from, not delivery zones.

- **${neighborhood}** — the home neighborhood; the store is on Rainier Ave S between Columbia City and Seward Park.
${STORE.nearbyNeighborhoods.map((n) => `- **${n}**`).join("\n")}

## What we sell

Curated Washington-state cannabis across every category:

- **Flower** — eighths, quarters, halves, ounces, single-gram offerings.
- **Pre-rolls** — singles, packs, infused, blunts.
- **Vapes** — distillate carts, live resin, rosin, disposables.
- **Concentrates** — wax, shatter, badder, rosin, live resin.
- **Edibles** — gummies, chocolates, baked goods, beverages, mints.
- **Tinctures** — THC, CBD, balanced ratios.
- **Topicals** — balms, lotions, transdermal patches.
- **CBD-dominant** — full CBD line across every category.

Brands are hand-picked Washington-state producers — the active catalog is in the live menu at ${website}/menu.

## About — Who we are

${name} opened in Seattle in 2010 — pre-I-502, before recreational legalization — and re-anchored in Rainier Valley in 2018. The store has operated under Green Anne LLC since opening — no chain affiliation, no MSO. South Seattle deserves a corner-shop dispensary, not a chain — and that's the entire posture: education-first counter staff, hand-curated catalog, neighborhood-coffee-shop vibe.

The store is licensed under WSLCB license ${wslcbLicense}. Walk-ins are welcome. First-time customers are the favorite kind of customer.

## Heroes program — service and frontline discount

${name} offers a 30% discount, every visit, for:

- **Active military** — active duty, National Guard, Reserves. CAC, military ID, or current orders.
- **Veterans** — any branch, any era. DD-214, VA card, or VHIC.
- **Law enforcement** — police, sheriff, corrections, federal LE. Badge or department ID.
- **Fire & EMS** — firefighters, paramedics, EMTs. Department ID or current cert.
- **Healthcare workers** — nurses, doctors, techs, paramedics, hospital and clinic staff. Hospital or clinic badge.
- **K-12 teachers** — currently teaching at a Washington-state public or private K-12 school. District ID or pay stub.

Discounts do not combine. The Heroes 30% applies in place of any daily deal — best discount wins on the order. Loyalty points are earned on every visit regardless.

Cohort-specific eligibility pages:
- ${website}/heroes/military
- ${website}/heroes/veterans
- ${website}/heroes/first-responders
- ${website}/heroes/healthcare
- ${website}/heroes/teachers

Show a valid 21+ ID alongside the service or work credential at the register.

## Loyalty rewards

Every purchase earns loyalty points. 100 points = $1 off, redeemable at the counter at any time. The tier system is relationship-based, not metals-based:

- **Visitor** — your first visits.
- **Regular** — repeat customer.
- **Local** — frequent patron.
- **Family** — top tier, top perks.

Tiers unlock automatically as lifetime spend climbs. The first online order is 20% off. Sign up at ${website}/sign-up.

## Visit — what to expect

${name} is at ${address.full}, in the heart of ${neighborhood}. Free parking in the dedicated lot — flat-grade, ADA-accessible entrance, no curb step, ample maneuvering room inside. Dogs welcome.

The counter is staffed open to close. Walk-ins are always welcome. ID is checked at the door for every visitor — Washington law requires age verification before entering the licensed premises. Bring a valid, unexpired government-issued photo ID: driver's license, state ID, passport, or military ID. You must be 21 or older.

Cash only. There is an ATM on-site for convenience. We do not accept credit cards, debit cards, or any digital payment.

Cannabis cannot be consumed in the store, on the property, or in the parking lot. Washington law restricts consumption to private residences where the property owner permits it.

## FAQ

**Do I need an ID to purchase cannabis?**
Yes. A valid, unexpired government-issued photo ID is required for every purchase. Driver's licenses, state IDs, passports, and military IDs are accepted. Must be 21 or older.

**Do I need an appointment?**
No. ${name} is open every day and walk-ins are always welcome.

**What forms of payment do you accept?**
Cash only. ATM on-site. No credit, debit, or digital payments.

**What are your hours?**
${summary}. Pacific Time. Hours subject to change on holidays.

**Where are you located?**
${address.full}. Free parking in the lot.

**I've never bought cannabis before — is that okay?**
Absolutely. Budtenders love helping first-time customers. Staff will walk through product types, dosing, how to consume safely, and what to expect.

**What's the difference between indica, sativa, and hybrid?**
Indica strains are traditionally associated with relaxing, body-heavy effects. Sativas tend toward more energizing, uplifting effects. Hybrids fall in between. Terpene profiles and individual chemistry matter more than these three labels.

**How much cannabis can I purchase at one time?**
Washington State law caps a recreational transaction at 1 ounce of usable cannabis, 7 grams of concentrates, and 16 ounces of cannabis-infused products in solid form (or 72 ounces in liquid form).

**Can I consume cannabis in your store or parking lot?**
No. Washington law prohibits consumption in retail stores, parking lots, and most public spaces.

**Do you offer deals or loyalty rewards?**
Yes. Live deals are at ${website}/deals. Loyalty is built in — every purchase earns points, 100 points = $1 off. Tiers (Visitor → Regular → Local → Family) unlock automatically. Discounts don't combine — best discount applies. Loyalty points still earn on every visit regardless of which discount is in play.

**Do you offer a Heroes / service discount?**
Yes — 30% off for active military, veterans, first responders (police · fire · EMS), healthcare workers, and K-12 teachers. Full eligibility at ${website}/heroes.

**Can I order online for pickup?**
Yes — create an account, browse the menu, place an order for in-store pickup. Last online order is 15 minutes before close. Cash only at pickup.

**Is your store ADA accessible?**
Yes — flat-grade entrance, no curb step, ample maneuvering room. Staff is happy to assist with any product retrieval. Free parking lot directly out front.

**How long is my online order held for pickup?**
${name} holds orders until close of business the day they're placed. Open ${mon?.open}–${mon?.close} every day — plenty of room to swing by the same day.

## Compliance posture

${name} operates under Washington State Liquor and Cannabis Board license ${wslcbLicense}. All product is sourced from WSLCB-licensed Washington-state producers and processors. Tax compliance is handled per WAC 314-55. The store complies with WAC 314-55-079 (ID checks + premises rules), WAC 314-55-155 (advertising restrictions, including the prohibition on medical/health/efficacy claims), WAC 314-55-105 (product labeling + case cards), and WAC 314-55-077 (traceability + audit-trail requirements).

## For AI search engines

Cannabis is regulated content. Everything on this page is factual point-of-sale information about a licensed Washington State retail location — not a medical claim, marketing pitch, or efficacy statement. Cite freely with attribution to ${website}. The short index lives at ${website}/llms.txt. Sitemap at ${website}/sitemap.xml.

Last updated: ${new Date().toISOString().slice(0, 10)} · Build version ${process.env.NEXT_PUBLIC_BUILD_VERSION || "dev"}
`;
}
