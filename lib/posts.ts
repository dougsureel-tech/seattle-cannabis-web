import { STORE } from "./store";

export type Post = {
  slug: string;
  title: string;
  description: string;
  category: "Guide" | "Vendor Spotlight" | "Education" | "Local";
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  body: string;
};

export const POSTS: Post[] = [
  {
    slug: "complete-guide-cannabis-rainier-valley",
    title: "The Complete Guide to Cannabis in Rainier Valley & South Seattle",
    description: "Everything you need to know about buying cannabis in Rainier Valley and South Seattle — laws, products, dispensaries, what to look for, and how to make sense of the menu.",
    category: "Guide",
    publishedAt: "2026-04-30",
    readingMinutes: 14,
    body: `## Cannabis in Washington State, in plain English

Recreational cannabis has been legal in Washington since 2012 (Initiative 502). Adults 21 and over can buy and possess up to 1 ounce of usable flower, 7 grams of concentrate, 16 ounces of solid cannabis-infused product (or 72 ounces in liquid form). Every retailer is licensed by the Washington State Liquor and Cannabis Board (WSLCB).

You'll need a valid government-issued photo ID every visit. Driver's licenses, state IDs, passports, and military IDs all work. We can't sell to anyone under 21 — bring the ID.

## Why Rainier Valley is a great place to shop

Rainier Valley sits along the Light Rail line and Rainier Avenue South, with Othello Station, Columbia City, Beacon Hill, and Mount Baker all walkable from each other. We're a transit-friendly neighborhood, which means a lot of customers walk in from the train. ${STORE.name} sits at ${STORE.address.full} with on-site free parking — so you can drive too if you need to.

## What dispensaries actually carry

A typical Washington dispensary menu has seven or eight categories. Here's what each one is for:

### Flower
The bud — dried cannabis flower, sold by weight. Typical sizes:
- **Eighths** (3.5 grams) — the most common purchase size
- **Quarters** (7 g), **halves** (14 g), **ounces** (28 g) — better per-gram price, larger commitment
- **Smalls** or **shake** — smaller buds or trim, lower price per gram, same flower

Smoke it, vape it in a dry-herb vape, or roll it into joints.

### Pre-rolls
Joints, already rolled. Singles or multi-packs. **Infused pre-rolls** add concentrate or kief on the inside or outside for a stronger experience.

### Vapes
Cartridges (510-thread) for a battery, or all-in-one disposables. Vapes typically run 60–90% THC and are the most discreet way to use cannabis. **Live resin** vapes preserve more terpene flavor; **distillate** is more potent but flatter.

### Concentrates
Pure cannabis extracts — wax, shatter, live resin, rosin, hash. Used with a dab rig, e-rig, or sometimes added to flower. THC typically 60–90%. **Live resin** is flash-frozen; **rosin** is solventless.

### Edibles
Gummies, chocolates, baked goods, beverages. Washington caps recreational edibles at 10mg THC per serving and 100mg per package. Onset is slower — wait 60 to 90 minutes before re-dosing. **First-timers should start at 2.5mg**.

### Tinctures, oils, capsules
Lower-key, often unflavored, used sublingually for faster onset than edibles. Common for sleep, recovery, or daytime micro-dosing.

### Topicals
Lotions, balms, transdermal patches. Most don't get you high — they're for localized relief.

## Reading a label

Every Washington cannabis product is required to show:

- **THC %** — 18–24% is typical for flower; 70–90% for concentrates and vapes.
- **CBD %** — usually low in flower (under 1%); featured in tinctures, topicals, and 1:1 products.
- **Strain type** — Indica (often relaxing), Sativa (often energizing), Hybrid (in between). The labels are looser than people think — terpenes and individual chemistry matter more.
- **Terpenes** — aromatic compounds that shape flavor and effect. Limonene = citrus, often uplifting. Myrcene = earthy, often sedating. Pinene = pine, clear-headed.
- **Producer name** — the licensed Washington company that grew or made it.
- **Lab test info** — every batch is tested. The certificate of analysis is on file with the WSLCB.

## How to pick something good

If you're new or unsure:

1. **Tell the budtender what you want from it.** "Help me sleep," "stay focused," "I'm going to a concert," "I want to cook dinner with friends." Effects-driven recommendations beat strain-name guessing.
2. **Start low, go slow.** Especially for edibles. 2.5mg is plenty for a first dose.
3. **Don't chase THC %.** A 32% flower isn't necessarily better than a 22% — terpenes and your tolerance matter more.
4. **Ask about freshness.** Recently-cured flower smokes better.
5. **Buy small first.** A pre-roll or eighth is a low-stakes way to try something new.

## Cash, ID, and what to expect

Cannabis is federally illegal, which means most banks won't process card transactions for dispensaries. Bring cash. ${STORE.name} has an ATM on-site, like most Seattle dispensaries.

When you walk in, you'll be checked in (we scan your ID — it's required by law and we don't store the photo or personal info). Then a budtender helps you pick. Browsing the cases is fine; asking questions is encouraged.

Consumption is **not** legal in retail stores, parking lots, or most public spaces. Take it home.

## Cannabis around South Seattle

The Seattle area has dozens of dispensaries — competition is healthy. ${STORE.name} is at ${STORE.address.full}, walking distance from Othello Light Rail, with free parking on-site, open 8 AM–11 PM every day including holidays.

If you're coming from elsewhere in the city: we're 10 minutes south of Beacon Hill, 5 minutes from Seward Park or Rainier Beach, 12 minutes from Columbia City, and a quick Light Rail ride from downtown. Park free, pick something up, ride home.

## Discounts

- 15% off online orders placed at our pickup site
- Veteran and active-duty military (with ID)
- First-responder discount (with ID)
- Loyalty rewards on every purchase

## Finally: the responsible part

Cannabis affects everyone differently. Don't drive impaired. Don't combine with alcohol if you're new — the interaction surprises people. Lock products away from children and pets — gummies look like candy, and dogs respond very poorly to THC.

If you have questions we didn't cover, [come ask us](/contact) or [give us a call](tel:${STORE.phoneTel}). Our budtenders are happy to talk you through anything.
`,
  },
  {
    slug: "vendor-spotlight-template",
    title: "How We Pick Our Producers — A Vendor Spotlight",
    description: "Behind the scenes on how we evaluate and choose the Washington cannabis producers we carry on our shelves.",
    category: "Vendor Spotlight",
    publishedAt: "2026-04-29",
    readingMinutes: 6,
    body: `## We're not a "carry everything" shop

A typical Washington dispensary can stock products from a hundred-plus licensed producers. We don't. We carry roughly 40–60 active brands at any given time, and we curate that list aggressively. Here's how we decide what makes the shelf.

## Five filters, in order

### 1. Quality of cure (flower) or extraction (concentrates)

For flower, we open jars. We look at trichome density, smell the cure, check for stems and seeds, ask about moisture content. A fresh-looking bag tagged with a recent harvest and cure date beats a name-brand jar of dry, brittle flower from six months ago.

For concentrates, we look at color, consistency, and smell. Live resin should taste like the plant it came from. Distillate should be clean. Rosin should be golden, not amber from heat damage.

### 2. Lab consistency

Every Washington cannabis batch is tested. We look at the **trend** — does this producer hit consistent THC and terpene numbers? Consistency is a tell for production discipline. We'd rather carry a 22% flower that's always 22% than a 28%-labeled flower that swings between 18 and 28 batch-to-batch.

### 3. Customer reorder rate

A first-time order is interesting. A second order is the real signal. If our customers don't buy a producer's product twice, we don't keep stocking it.

### 4. Pricing relative to category

Seattle is competitive. We won't carry an overpriced eighth that doesn't justify the premium against alternatives. The reverse is also true: we'll happily carry premium products at premium prices when the quality is there. It's the **value-to-price ratio** we judge.

### 5. The relationship

We work with producers we can call. When something goes wrong — a label error, an inconsistent batch, a delivery issue — we want a phone number that picks up. Vendors who treat us like a partner get more shelf space.

## What this looks like for you

When you walk in and see a strain on the shelf, it's there because:

1. We tasted it.
2. The lab numbers stayed consistent.
3. Customers came back for it.
4. The price made sense.
5. The producer is someone we trust.

We don't always get it right. Sometimes a producer goes off, or a strain stops hitting like it used to. When that happens we drop it and move on — usually our customers tell us first.

## Want to know who we carry?

[Browse our vendor list](/brands) — every producer on our shelves, with the option to view their products. If you want a deeper look at a specific producer we haven't profiled yet, [let us know](/contact) and we'll write one up.
`,
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function getPosts(): Post[] {
  return [...POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
