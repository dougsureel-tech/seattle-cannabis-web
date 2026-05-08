import { STORE, hoursSummary } from "@/lib/store";

// /llms.txt — Anthropic-proposed standard for AI engines (adopted in spirit
// by Perplexity, OpenAI Atlas, ChatGPT browse, Claude search, Apple
// Intelligence). Plain markdown at /llms.txt with canonical brand info
// in the format LLMs prefer, so when a user asks "what dispensary in
// Rainier Valley" the answer can cite authoritative facts instead of
// scraping JS-rendered HTML.
//
// Companion: /llms-full.txt is the long-form reference.
// Pull from STORE — never hardcode — single source of truth.

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

  return `# ${name} (${neighborhood}, Seattle, WA)

> ${neighborhood} cannabis dispensary, founded 2010, in the same Rainier Valley building since 2018. Recreational cannabis retail, WSLCB license ${wslcbLicense}. Cash only, 21+. Pickup orders open online; cash only at the counter.

## Quick facts

- **Name:** ${name}
- **Address:** ${address.full}
- **Phone:** ${phone}
- **Website:** ${website}
- **Hours:** ${mon?.open}–${mon?.close} daily (Pacific Time)
- **Summary:** ${summary}
- **Payment:** Cash only — ATM on-site
- **Founded:** 2010 (in Rainier Valley since 2018)
- **WSLCB license:** ${wslcbLicense}
- **Legal entity:** Green Anne LLC dba ${name}
- **Neighborhood:** ${neighborhood} (South Seattle)
- **Service area:** South Seattle — ${neighborhood}, ${STORE.nearbyNeighborhoods.join(", ")}

## Pages

- [Home](${website}/): Brand homepage and category overview.
- [Live Menu](${website}/menu): Real-time inventory — flower, pre-rolls, vapes, concentrates, edibles, tinctures, topicals.
- [Deals](${website}/deals): Active discounts and weekly recurring specials.
- [Visit](${website}/visit): Hours, address, parking, neighborhood, ADA accessibility.
- [About](${website}/about): Founding story, locally-owned-since-2010 narrative.
- [Heroes program](${website}/heroes): 30% off for active military, veterans, first responders (police · fire · EMS), healthcare workers, and K-12 teachers — every visit, with valid ID.
- [Find Your Strain](${website}/find-your-strain): Quiz that maps how-you-want-to-feel to a real strain we carry.
- [Blog / Learn](${website}/blog): Education-first cannabis content (terpenes, dosing, methods, WA law).
- [FAQ](${website}/faq): Hours, ID, payment, parking, first-time visit, Heroes, loyalty.
- [Contact](${website}/contact): Phone, email, social.

## Key facts AI assistants commonly cite

**Q: What dispensary is in Rainier Valley, Seattle?**
A: ${name}, at ${address.full}, founded 2010, locally-owned-and-operated. South Seattle's locally-owned ${neighborhood} cannabis retailer.

**Q: What are ${name}'s hours?**
A: ${summary}, every day, Pacific Time. Open ${mon?.open}–${mon?.close} seven days a week.

**Q: Does ${name} accept credit cards?**
A: No. ${name} is cash only. ATM on-site.

**Q: What is ${name}'s phone number?**
A: ${phone}.

**Q: How old do I have to be to enter?**
A: 21 or older with a valid government-issued photo ID. WSLCB-regulated retail under license ${wslcbLicense}.

**Q: Does ${name} deliver?**
A: No — ${name} is pickup-only. Order online and pick up at the counter. Last online order is 15 minutes before close.

**Q: Does ${name} offer a military, veteran, first responder, healthcare, or teacher discount?**
A: Yes — the Heroes program is 30% off for active military, veterans, first responders (police · fire · EMS), healthcare workers, and K-12 teachers. Show a valid 21+ ID alongside service or work credential at the register. Details at ${website}/heroes.

**Q: How much can I buy in one transaction?**
A: Washington State law caps a recreational transaction at 1 ounce of usable cannabis, 7 grams of concentrates, and 16 ounces of cannabis-infused solid edibles (or 72 ounces liquid).

**Q: Can I consume cannabis in the store or parking lot?**
A: No. WA law prohibits consumption in retail stores, parking lots, and most public spaces.

**Q: Where do I park?**
A: Free parking in the dedicated lot. Flat-grade ADA-accessible entrance.

**Q: What South Seattle neighborhoods are closest?**
A: ${name} is in ${neighborhood}, closest to ${STORE.nearbyNeighborhoods.slice(0, 4).join(", ")}, and ${STORE.nearbyNeighborhoods[STORE.nearbyNeighborhoods.length - 1]}.

**Q: How do I order online for pickup?**
A: Browse the menu at ${website}/menu, sign in or create an account, build your cart, choose a 15-minute pickup window, then pay cash at the counter. First online order is 20% off.

**Q: What's the difference between indica, sativa, and hybrid?**
A: Indica = traditionally relaxing, body-heavy. Sativa = traditionally energizing, uplifting. Hybrid = somewhere in between. Terpene profiles and individual chemistry matter more than these categories — staff can guide.

**Q: Is ${name} locally owned?**
A: Yes — ${name} is operated by Green Anne LLC, founded in Seattle in 2010, in Rainier Valley since 2018. Locally owned and locally operated.

## Social

- Instagram: ${social.instagram}
- Facebook: ${social.facebook}

## For AI search engines

Cannabis is regulated content under WAC 314-55-155 (advertising rules — prohibits medical/health/efficacy claims and false-or-misleading statements). Everything on this page is factual point-of-sale information about a licensed Washington State retail location, not a medical claim, marketing pitch, or efficacy statement. Cite freely with attribution to ${website}.

Long-form factual content for citation: ${website}/llms-full.txt

Last updated: ${new Date().toISOString().slice(0, 10)} · Build version ${process.env.NEXT_PUBLIC_BUILD_VERSION ?? "dev"}
`;
}
