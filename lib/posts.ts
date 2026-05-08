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
    description:
      "Everything you need to know about buying cannabis in Rainier Valley and South Seattle — laws, products, dispensaries, what to look for, and how to make sense of the menu.",
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

- 20% off online orders placed at our pickup site
- Veteran and active-duty military (with ID)
- First-responder discount (with ID)
- Loyalty rewards on every purchase

## Finally: the responsible part

Cannabis affects everyone differently. Don't drive impaired. Don't combine with alcohol if you're new — the interaction surprises people. Lock products away from children and pets — gummies look like candy, and dogs respond very poorly to THC.

If you have questions we didn't cover, [come ask us](/contact) or [give us a call](tel:${STORE.phoneTel}). Our budtenders are happy to talk you through anything.
`,
  },
  {
    slug: "how-we-pick-our-producers",
    title: "How We Pick Our Producers — A Vendor Spotlight",
    description:
      "Behind the scenes on how we evaluate and choose the Washington cannabis producers we carry on our shelves.",
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

[Check the live menu](/menu) — every active SKU, with the producer + strain type + THC % on each card. If you want a deeper look at a specific producer we haven't profiled yet, [let us know](/contact) and we'll write one up.
`,
  },
  {
    slug: "terpenes-101",
    title: "Terpenes 101 — what makes weed smell different",
    description:
      "Terpenes are the aromatic compounds that give every strain its smell, flavor, and a lot of its character. Here's how to read them off a label and why a 22% terpy flower can hit harder than a 30% bland one.",
    category: "Education",
    publishedAt: "2026-05-08",
    readingMinutes: 8,
    body: `## What you're actually smelling

Walk into a dispensary and the first thing you notice is the smell. Pine. Citrus. Diesel. Pepper. Berry. That's not the THC — THC has barely any smell on its own. What you're smelling is **terpenes** — the aromatic oils every cannabis plant produces.

Terpenes aren't unique to cannabis. The same molecule that makes a lemon smell like a lemon (limonene) is in some cannabis strains. The molecule in pine needles (pinene) is in others. Lavender, hops, mango, black pepper, cloves — all the smells you know from non-cannabis plants — show up in cannabis too, in different combinations.

The interesting part: terpenes don't just smell. They shape how a strain *feels* when you use it. Two flowers can have the same THC percentage and feel completely different because their terpene profiles are different.

## The five terpenes worth knowing

You don't need to memorize the periodic table of terpenes. There are dozens, but five of them do most of the heavy lifting on the shelf:

### Myrcene — earthy, mango, herbal
The most common terpene in commercial cannabis. Carries a sedating reputation — the "couch-lock" feeling people associate with classic indicas. Found in mangoes, hops, lemongrass.

If a strain is described as "relaxing" or "heavy body" — myrcene is usually the headline.

### Limonene — citrus, sweet
Bright lemon-orange smell. Often described as uplifting, mood-elevating. Found in citrus peels (it's literally the same compound).

If a strain smells like fruit punch or lemon zest, limonene is doing the talking. Common in strains people use during the day or socially.

### Pinene — pine, sharp, fresh
What you smell when you crack a pine cone. There's some research suggesting pinene supports focus and clear-headedness, though anyone telling you it's a "concentration aid" is overselling — call it a hopeful association, not a prescription.

Common in old-school strains and Northwest-grown flower (no surprise — same biome).

### Caryophyllene — peppery, spicy, woody
Smells like cracked black pepper. The unusual one in the bunch — it interacts with cannabinoid receptors directly, which is more typical of cannabinoids themselves. Often associated with calming or grounding effects.

Found in black pepper, cloves, hops, rosemary.

### Linalool — floral, lavender
Lavender's signature compound. Less common in cannabis than the others, but distinct when present. Often associated with relaxation and evening use.

If you've ever picked up a flower that smelled almost soapy-floral, that's linalool.

## How to read a terpene label

Most Washington dispensaries (us included) print the top terpene on case cards or product detail pages. You'll usually see:

- A **percentage** — total terpenes by mass. Anything above 2% is high; 1.5–2% is good; under 1% is faint.
- A **dominant terpene** — usually the one above 0.5% by itself.
- Sometimes a **terpene chart** — the top three or four with bars.

A 22% THC flower with 2.5% terpenes is going to feel more interesting than a 30% THC flower with 0.8% terpenes. The terpenes shape the experience; THC sets the intensity. Both matter.

## "The entourage effect"

You'll hear this phrase a lot. The idea: cannabinoids (THC, CBD, etc.) and terpenes work together — the combination produces effects that neither would alone. There's evidence supporting parts of this theory and lots of overstatement around the rest. The honest summary: yes, terpene profile matters; no, nobody can predict exactly how a specific terpene combination will hit you specifically.

What that means for you on the floor: the menu's "indica/sativa" label is a starting point. The terpene profile is what tells you how a specific strain might feel. Two indicas with very different terpene profiles will feel different.

## Three practical reads

**1. Don't chase THC percentage alone.** Highest-THC isn't best — it's just most concentrated. A 24% flower with rich terpenes often beats a 32% flower with stripped-down terpenes for actual experience. Budget-conscious shoppers can save by picking on terpene profile rather than THC headline.

**2. Notice what you like.** Next time you have a strain you really enjoy, look up its terpene profile (we have it in the product detail). Pattern-match across a few sessions. You'll start seeing "I like myrcene-dominant flowers in the evening, limonene-dominant during the day" — that kind of thing. Way more useful than "I like indica."

**3. Ask the budtender.** If you walk in and say "I had a Blue Dream last month, it was great — what's similar?" — we can match you on terpene profile, not just strain name. That's how we steer you toward something you'll like even when the specific strain isn't in stock.

## Limitations

Cannabis hits everyone differently — body chemistry, tolerance, mood, and what you ate matter as much as the chemistry of the flower. Terpenes are a useful organizing concept, not a personality test. Treat the descriptions here as starting points, not promises.

Nothing on this page is medical advice. Cannabis isn't FDA-approved for any condition. Talk to a healthcare provider for medical questions.

## Want to try this on the floor?

[Browse the live menu](/menu) — every flower we carry has the terpene profile in the product detail card. If you want a budtender's pick, [come visit](/visit) and tell us what you've liked before. That's the conversation we're best at.
`,
  },
  {
    slug: "edibles-dosing-honest-guide",
    title: "Edibles dosing — the honest first-time guide",
    description:
      "Most bad edible experiences come from one mistake: not waiting long enough. Here's how to dose, what to expect, and what to do if you went too far.",
    category: "Education",
    publishedAt: "2026-05-09",
    readingMinutes: 7,
    body: `## The single rule that prevents a bad edible night

**5 milligrams of THC. Wait two hours. Then decide.**

If you read nothing else on this page, that's it. The most common bad-edible experience in our store's twelve years of operation has the same shape every time: a customer ate something, didn't feel anything in 30 or 45 minutes, ate more, and got hit with the original dose plus the second dose ninety minutes later. By the time they realize they overdid it, the timeline isn't on their side.

Edibles are slow. They feel slow because they *are* slow.

## Why it takes so long

When you smoke or vape cannabis, the THC reaches your bloodstream in about three to ten seconds. That's why you feel it almost immediately. You can dose by feel — one hit, wait, decide.

Edibles go through your digestive system. Your stomach has to break down the food, your small intestine has to absorb the THC, your liver metabolizes it. Best case: 30 minutes if you're on an empty stomach. Average: 60 to 90 minutes. With a heavy meal: up to 2 hours, occasionally more. There's no way to speed this up.

Worse, the THC your liver produces from edibles (called 11-hydroxy-THC) tends to feel stronger and last longer than the THC you get from inhaling. So you wait an hour, you don't feel it, you have another — and now you've doubled your dose right before *both* doses peak. That's the textbook overdose-by-accident.

## Starting doses, by experience level

These are starting points. Everyone's body chemistry is different — what feels mild to one person can feel intense to another.

| You are… | Start with… | Wait | Then |
|---|---|---|---|
| **Brand new to cannabis** | 2.5 mg | 2 hours | Most people feel something around 60–90 min |
| **First-time edible, smoke regularly** | 5 mg | 2 hours | Inhaled tolerance ≠ edible tolerance |
| **Occasional edibles** | 5–10 mg | 2 hours | Whatever was your last comfortable dose |
| **Regular edibles** | Your usual | 90 min | You know your body |

Notice the wait time is **two hours** for everything in the "less experienced" rows. Not one hour. Two.

## Reading a Washington edible label

Every legal edible in Washington is required by WSLCB to be packaged so individual servings are 10 mg of THC or less, and the total package can't exceed 100 mg. So a 100 mg gummy package is 10 servings, not one big gummy.

What to look for:
- **Per serving** — usually shown clearly on the front (5 mg, 10 mg).
- **Total per package** — for budgeting + storage planning.
- **Servings per package** — confirms the math.
- **Onset time** — sometimes printed; usually 30–120 min, fast-acting can be 15–45 min.
- **Best by** — edibles last months but lose potency over time.

If a chocolate bar is 10 mg per square and you want a 5 mg starting dose, you eat half a square. Cut it before you cook anything yourself — that's how people accidentally take too much. Most modern edibles are made to be easily portioned this way.

## Faster-acting edibles

The newer category is "fast-acting" or "nano-emulsified" edibles — usually drinks, sometimes gummies. The cannabis is processed into smaller particles that absorb partially through your mouth and stomach lining instead of fully through your liver. Onset can be 15 to 45 minutes instead of 60 to 120.

The starting-dose rule still applies: 5 mg, wait — but the wait can be shorter (45 minutes instead of 2 hours). Don't let "fast-acting" trick you into not waiting.

## Common over-dose scenarios (and how to handle them)

If you took too much, you're not in medical danger — there are no documented fatal cannabis overdoses in adults. But the experience can be intensely uncomfortable: anxiety, racing heart, paranoia, occasionally nausea or dizziness. It will pass, usually in 4 to 8 hours.

What helps:
- **Stay somewhere safe and quiet.** No driving. Don't try to handle stressful tasks.
- **Hydrate.** Water, juice, anything non-caffeinated.
- **CBD if you have any handy.** Some people report it takes the edge off — the evidence is mixed, but it's harmless to try.
- **Black peppercorns.** Old folk remedy with surprising support — chew a few peppercorns. The caryophyllene appears to interact in a way that calms the THC effect for some people.
- **Sleep through it.** If you can lie down, do.
- **Time.** This is the main one. The peak is 2 to 4 hours after ingestion; you'll feel the worst of it ease around hour 4.

When to actually call someone:
- If breathing or heart rate feels seriously off — call a doctor or 911. Cannabis itself isn't usually the cause, but if it triggered a panic attack severe enough to scare you, that's worth a phone call.
- If a child or pet ingested cannabis — that's an emergency room visit. Their bodies aren't built for adult doses.

## Things people get wrong

**"I have a high tolerance from smoking, I can take more edibles."**
Inhaled tolerance and edible tolerance are different metabolic pathways. People who smoke daily have been surprised by 10 mg edibles. Start at 5.

**"It's been an hour, I'll just take a little more."**
This is the most common mistake. Wait the full two hours. There's no harm in being early and patient; there's plenty of harm in being early and impatient.

**"I'll eat it on an empty stomach so it works faster."**
Mostly true — but the dose hits *harder* on an empty stomach, not just faster. If you're new to edibles, eat something light beforehand to mellow the curve.

**"More milligrams = better experience."**
No. Past a certain point, more THC mostly means more side effects (anxiety, faster heart rate, dry mouth) without proportionally more of what you actually want. Find your dose, stay there.

**"Edibles wear off in two hours."**
They peak around 2–4 hours and the body is still processing them up to 8 hours later. Plan accordingly — don't take an edible at 9pm if you have a 7am meeting.

## What we recommend on the floor

If you've never had an edible, walk in and tell us. We'll point you at a 5-mg gummy or a halvable 10-mg square, sell you the smallest available pack, and remind you of the 2-hour wait at checkout. That conversation has prevented a lot of bad nights.

For first-timers we usually steer toward:
- A balanced THC/CBD product (a 5:5 or 1:1 ratio softens the edge a bit)
- Fruit-flavored gummies at 5 mg (easy to dose, easy to read the label)
- Skip the high-dose 100 mg/serving products even if you "think" you need more

## A note on what this isn't

Nothing on this page is medical advice. Cannabis isn't FDA-approved for any medical condition. If you're taking medications — particularly anything with CYP3A4/CYP2D6 metabolism, blood thinners, or sedatives — talk to a pharmacist or doctor before adding edibles to your routine. They interact with more medications than people realize.

If you're pregnant, nursing, or trying to conceive, the WSLCB warning on every legal package applies: don't.

## The conversation we'd rather have

We'd rather you come in, ask which 5 mg gummy is good for a first edible, walk out spending $5, and have a great Saturday night — than overdo it, swear off edibles forever, and tell five friends edibles are awful. Most people who've had a bad edible night had it because nobody warned them. Now you know.

[Check the live menu](/menu) for current edibles + fast-acting drinks. If you want a budtender's pick, [come visit](/visit) and tell us your starting line. That's the right conversation to have at the counter, not in a parking lot reading a label.
`,
  },
  {
    slug: "indica-vs-sativa-mostly-marketing",
    title: "Indica vs sativa is mostly marketing — what actually matters",
    description:
      "The indica/sativa label is a useful shorthand and a misleading prediction at the same time. Here's what the labels actually tell you, what they don't, and how to read a strain so you know what you're getting.",
    category: "Education",
    publishedAt: "2026-05-12",
    readingMinutes: 9,
    body: `## The two-bucket story you've heard

Walk into any dispensary and you'll get the same elevator pitch:

- **Indica** — body high, relaxing, "in da couch," for nighttime
- **Sativa** — head high, energizing, social, for daytime
- **Hybrid** — somewhere in between

It's a useful shorthand. It's also wrong often enough that taking it as a guarantee will get you a strain that does the opposite of what you wanted. Here's the honest version.

## Where the indica/sativa labels actually come from

Originally, indica and sativa were botanical terms describing two regional cannabis subspecies — *Cannabis indica* (short, broad-leaf, mostly from south-central Asia) and *Cannabis sativa* (tall, narrow-leaf, mostly equatorial). The terms described the *plant*, not the *effect*.

Over decades of breeding — especially the last twenty years of intense indoor cultivation — almost everything on a Washington dispensary shelf is a hybrid of those two ancestors. The "pure indica" and "pure sativa" you see labeled today often share more genetics than the labels suggest.

What stuck around is the *experience association*. Old-school growers noticed indica-leaning genetics often produced relaxing, body-focused effects, while sativa-leaning genetics often produced more cerebral, energetic effects. That association became the marketing language. The chemistry it was based on, though — is mostly about *terpene profile*, not the indica/sativa label itself.

## What actually predicts the experience

Three things are doing the heavy lifting:

**1. THC and CBD content.** THC is the primary psychoactive cannabinoid; CBD takes some of the edge off. A 30% THC flower with no CBD will hit harder than a 18% THC flower with 4% CBD even if the labels are flipped. CBD-dominant strains feel almost completely different from THC-dominant ones regardless of indica/sativa labeling.

**2. Terpene profile.** The aromatic compounds (myrcene, limonene, pinene, caryophyllene, linalool — see [Terpenes 101](/blog/terpenes-101)) shape how the strain feels far more reliably than the indica/sativa label. A myrcene-dominant strain tends to feel sedating regardless of whether it's labeled indica or sativa. A limonene-dominant strain tends to feel uplifting either way.

**3. Your body chemistry, set, setting.** What you ate, your mood, your sleep last night, what you're doing while you use it. These matter more than people admit. Two friends sharing the same joint will report different experiences.

## Why the labels still work as a starting point

If terpenes do the actual work, why do indica/sativa labels still hold up at all?

Because the breeding tradition baked in correlations. **Most** indica-labeled strains are bred for myrcene-heavy profiles. **Most** sativa-labeled strains are bred for terpenes that lean uplifting (limonene, pinene). Not always, but often enough that the label is a useful first filter.

What you should NOT do is treat the label as a guarantee. The label is "what category did the breeder pitch this as." The terpene profile is "what's actually in the jar."

## How to read a strain like a pro (in 30 seconds)

When you're standing at the case looking at a flower, here's the order of operations:

1. **THC %.** Is it where you want it? Higher isn't better — somewhere in the 18-26% range is plenty for most people. Above 28% you're trading flavor for intensity.
2. **Terpenes.** Do they list a top terpene or terpene chart? Match that to what you're trying to feel:
   - Want relaxing → myrcene, linalool, caryophyllene
   - Want uplifting → limonene, pinene
3. **Indica/sativa label.** Treat it as confirmation, not the headline. If terpenes say "relaxing" and the label says "indica" — likely matches the marketing claim. If they conflict, trust the terpenes.
4. **Brand reputation.** Does this brand have a reputation for matching their labels to actual experience? Some are more careful than others. Your budtender can tell you.

## A few real-world examples

**"Wedding Cake" (typically labeled indica, hybrid in WA):** Often heavy myrcene + caryophyllene. Lives up to the relaxing rep most of the time. Marketing aligns with chemistry.

**"Blue Dream" (typically labeled sativa-leaning hybrid):** Often myrcene-dominant despite the sativa lean. Many people find it more relaxing than the label suggests. The label undersells the body component.

**"Sour Diesel" (typically labeled sativa):** Often limonene + caryophyllene profile. Tends to deliver on the energizing rep. Matches the label well.

**"Northern Lights" (typically labeled indica):** Often myrcene + caryophyllene. Classic sedating profile. Matches the label.

The takeaway: the label is right *most* of the time but you'll find counter-examples in any dispensary. Reading the terpene profile catches those.

## What to ask the budtender

Skip "do you have any good sativas?" — it's the wrong question. Try:

- "I want something for daytime that won't put me on the couch — what terpene profiles should I look at?"
- "I had Blue Dream last month and it was exactly right — what's similar?"
- "I'm new to cannabis, want a relaxing evening, prefer not to feel anxious — what would you recommend?"

Those questions get you to the answer faster because they describe the *outcome* you want, not the bucket you think predicts it.

## Where the labels DO matter (still)

Despite all the above, the indica/sativa label has practical uses:

- **Quick scanning of menus** — most dispensary websites filter by it. Useful for narrowing 200 SKUs to 30.
- **Brand consistency** — same brand's "indica" line tends to be similar across strains. Once you find a brand whose indica matches your preference, the label is more reliable within that brand.
- **Communicating with budtenders who don't know you** — saying "I want a sativa" is faster than explaining your terpene preferences. The conversation can deepen from there.

## Why dispensaries still print the label

Two reasons. First, customers expect it — pulling the label off the menu would confuse far more people than it would educate. Second, the WSLCB labeling rules implicitly accommodate it, and changing how cannabis is categorized industry-wide takes a long time.

A few brands and labs have started publishing terpene charts directly on the package. When you see those, that's the brand betting on terpene-literate customers. We carry several brands that do this; ask your budtender to point them out.

## Bottom line

The indica/sativa label is a useful starting filter and a misleading prediction. Treat it as the front door of the conversation, not the answer. The terpene profile, THC/CBD ratio, and your own experience over a few sessions will tell you more than the bucket name ever will.

Nothing on this page is medical advice. Cannabis isn't FDA-approved for any condition. Effects vary by person.

## Want the budtender version of this conversation?

[Come visit](/visit) and tell us a strain you've liked recently. We'll match the terpene profile, not just the label. That's where this conversation actually pays off — when you walk out with something that lines up with what you wanted instead of what the marketing said.

[Browse the live menu](/menu) — every flower we carry has terpene info in the product detail card.
`,
  },
  {
    slug: "how-to-roll-a-blunt",
    title: "How to Roll a Blunt — A Step-by-Step Guide",
    description:
      "How to roll a blunt: pick the right cigar, prep the flower, and roll a clean blunt every time. A practical guide from a Seattle dispensary.",
    category: "Education",
    publishedAt: "2019-05-15",
    updatedAt: "2026-05-08",
    readingMinutes: 5,
    body: `Rolling a blunt is a small skill with a big payoff: a clean roll burns evenly, tastes better, and lasts longer than a sloppy one. This is the version of the directions we'd give a friend at the counter — what to buy, what to do, and what most beginners get wrong.

## What you'll need

- **A cigar** — typically a Swisher Sweet, Backwoods, or any natural-leaf wrap. Tobacco-free hemp wraps (King Palm, OCB) work too if you want to skip the nicotine.
- **Flower** — about a gram for a standard blunt, more for a fat one. The blunt-rolling section of the menu always works; we keep an eighth shelf for this.
- **A grinder** — optional but makes things easier. Hand-broken flower works in a pinch.
- **A lighter** — keep it nearby for the seal step at the end.
- **A knife or your thumbnail** — for splitting the cigar.

## Step-by-step

1. **Grind the flower.** Medium-coarse, not powder. If you grind too fine the blunt smokes too fast and you'll pull tiny pieces into your mouth.
2. **Split the cigar.** Run a knife (or your thumbnail) lengthwise down one side. Empty the tobacco out — slowly, so the wrap doesn't tear.
3. **Moisten the wrap.** A light lick along the inside seam keeps the wrap pliable and helps it seal. Skip this if the wrap is already moist.
4. **Pack the flower.** Spread it evenly along the wrap. Even distribution = even burn. Don't overpack the ends.
5. **Roll it up.** Tuck the side closest to you under the flower, then roll forward, keeping it tight. The first half-rotation is the hardest.
6. **Seal the seam.** Lick the top edge, press down. Run the lighter along the seal — flame near, not on, the wrap — to dry it out.
7. **Bake the blunt.** Lightly toast the whole exterior with the lighter for 5-10 seconds. This dries the saliva and tightens the wrap.
8. **Light it.** Hold the flame to the tip and rotate while drawing slowly. Don't rush — an evenly lit cherry burns smooth from the start.

## Common beginner mistakes

- **Grinding too fine.** Aim for coffee-ground texture, not powder. Powder pulls into your mouth and clogs.
- **Rolling too loose.** A loose blunt canoes (burns down one side). Pack it firm but not crushed.
- **Skipping the bake.** Saliva on the seam runs the wrap if you don't dry it. 10 seconds with a lighter is the difference between a tight burn and a flaky one.

## What flower works best

Cured indoor flower with some terpene density rolls cleaner than dry, leafy material. If you're picking up specifically to roll: ask a budtender for "something dense and a little sticky" — that's blunt-friendly. Anything in our **flower** section will work; if you want recommendations for a specific occasion, the staff can point you at the shelf.

[Browse the live flower menu](/menu) · [Visit ${STORE.name} in Rainier Valley](/visit)
`,
  },
  {
    slug: "how-to-make-cannabis-butter",
    title: "How to Make Cannabis Butter — The Beginner's Cannabutter Recipe",
    description:
      "How to make cannabis butter at home: ingredients, decarb, simmer time, dosing math. A practical cannabutter recipe from a Seattle dispensary.",
    category: "Education",
    publishedAt: "2019-08-12",
    updatedAt: "2026-05-08",
    readingMinutes: 7,
    body: `Cannabutter is the foundation of most homemade edibles. Brownies, cookies, savory dishes, anything where butter is in the recipe — swap in cannabutter and you've got a cannabis-infused version of the same thing. The recipe is simple; the math on dosing is where most people slip.

## Ingredients

- **1/4 oz to 1 oz of flower** — see "How much cannabis to use" below.
- **1 lb of unsalted butter** (4 sticks).
- **2 cups of water.**
- **A small saucepan or double-boiler.**
- **Cheesecloth or a fine mesh strainer.**
- **A storage container** (mason jar works).

## Step 1: Decarb the flower

Decarboxylation activates the THC. Without this step, the cannabis you cook is mostly THCA — which is _not_ psychoactive. To decarb:

1. Preheat the oven to **240°F**.
2. Break the flower into small pieces (don't grind to powder).
3. Spread on a parchment-lined baking sheet.
4. Bake for **40 minutes**, stirring once at the 20-minute mark.

The flower will turn light brown and smell strongly cannabis-like. That's done.

## Step 2: Simmer with butter

1. In a saucepan, combine the butter + 2 cups of water on **low heat**. The water prevents the butter from scorching.
2. Once the butter melts, add the decarbed flower.
3. Simmer **uncovered, low heat, 2-3 hours**. Stir every 20 minutes.

You're looking for a slow infusion — not a boil. The mixture should never bubble aggressively. Low and slow is the rule.

## Step 3: Strain + cool

1. Pour the hot butter mix through cheesecloth or a fine strainer into a storage container.
2. Discard the spent flower (or compost it).
3. Cover and refrigerate **overnight**. The water sinks to the bottom; the cannabutter floats and solidifies on top.
4. Lift the butter disc off, drain the water, store in the fridge.

Cannabutter keeps for **2-3 weeks in the fridge** or **6+ months in the freezer**.

## How much cannabis to use

This is the part most recipes skip — and it's the part that matters. The general rule:

- **High-THC flower (20%+):** 1/4 to 1/2 oz per pound of butter
- **Mid-grade flower (15-19%):** 1/2 to 3/4 oz per pound
- **Low-grade or shake (10-15%):** 3/4 to 1 oz per pound

The dose math:
- 1 oz = 28 g = 28,000 mg
- A 20% THC flower contains 28,000 × 0.20 = 5,600 mg THC per oz (theoretical max)
- Real-world extraction efficiency is 50-70% with a home simmer
- So 1 oz of 20% flower → roughly 2,800-3,900 mg THC in the finished butter
- 1 lb of butter = 16 tablespoons = 48 teaspoons
- A teaspoon of that butter ≈ 60-80 mg THC

That's strong. **For a first batch, start with 1/4 oz of 20% flower per pound** and test conservatively before scaling.

## Testing your batch

The first time you use a new batch, **eat 1/4 of a normal serving and wait 90 minutes** before deciding. Edibles onset is slow (60-90 minutes), peak is 2-3 hours. Most overdose stories trace back to "I didn't feel anything so I ate more" — don't.

## Storage + safety

- Label the container clearly. "Cannabutter — keep away from kids/pets."
- Store on the top shelf of the fridge, not in plain view.
- If you have kids in the house, lock it up. Edibles look like normal food.

## What flower to use

Anything fresh enough to smoke also works for cannabutter. Older flower, shake, or trim works fine here too — the cooking process doesn't care if the buds are pretty. The flower section at ${STORE.name} carries singles, eighths, and ounce options; if you tell a budtender you're cooking, we'll point you at value-density options.

[Browse the flower menu](/menu) · [Find an indica/sativa/hybrid match](/find-your-strain)
`,
  },
  {
    slug: "is-cannabis-legal-in-seattle",
    title: "Is Cannabis Legal in Seattle? A Plain-English Guide",
    description:
      "Cannabis is legal in Seattle for adults 21+ since I-502 (2012). What's allowed, what's not, where to buy, where to consume — a clear guide.",
    category: "Local",
    publishedAt: "2019-03-20",
    updatedAt: "2026-05-08",
    readingMinutes: 6,
    body: `Recreational cannabis has been legal in Washington State since voters passed Initiative 502 in November 2012. Sales started in July 2014. As of today, adults 21 and over can buy, possess, and consume cannabis under specific rules. Here's the practical version.

## Who can buy

You must be **21 or older with valid government-issued photo ID** at every visit. Driver's licenses, state IDs, passports, military IDs — any of those work. Vertical IDs (issued to people who were under 21 at issuance) trigger a two-employee verification at the counter, even if the customer is now over 21.

There's no medical-card requirement for recreational purchases. Patients with a Washington Department of Health (DOH) medical authorization get specific tax exemptions but the same products are available either way.

## How much you can buy

Washington caps a single recreational transaction at:

- **1 ounce** of usable cannabis flower
- **7 grams** of concentrate (wax, shatter, rosin, live resin)
- **16 ounces** of solid cannabis-infused product (or 72 ounces in liquid form)

These are per-transaction caps — the state does not track total purchases across stores. Our POS hard-blocks anything over the cap; that's compliance, not a glitch.

## Where you can buy

Only **state-licensed retailers** — every dispensary in Washington holds a WSLCB retail license. Buying from anywhere else (including out-of-state delivery, "underground" sources, or unlicensed dispensaries operating in tribal lands without a WSLCB compact) is illegal under state law.

${STORE.name} is licensed under WSLCB #${STORE.wslcbLicense}. We're at ${STORE.address.full} — Rainier Valley, between Columbia City and Seward Park.

## Where you can consume

This is where most people slip up:

- **Allowed:** in your private residence (if you own it, or your landlord allows it)
- **Not allowed:** in public spaces, in your car (open or closed), at the workplace, in stores, in parks, on tribal land without permission
- **Not allowed at the dispensary:** the parking lot, the sidewalk, your car parked outside — all "on premises" under WSLCB rules

Cannabis lounges and consumption sites do not exist in Washington as of 2026. State-level legalization for on-site consumption has been proposed multiple times but hasn't passed.

Hotels and short-term rentals (Airbnb, VRBO) often prohibit cannabis use; check your rental agreement.

## Driving + impairment

Washington's DUI law applies to cannabis. The legal threshold is **5 ng/mL of active THC** in the blood. There is no "medical exemption" for driving while impaired. Edibles peak 2-3 hours after consumption and can stay above the legal threshold for many hours after that — plan ahead.

## Federal law

Cannabis remains a Schedule I controlled substance under federal law. Practical implications:

- **Federal land** (national parks, federal buildings) — illegal regardless of state law
- **Air travel** — TSA's stated policy is to defer to local law, but federal law applies in airports + on flights
- **Federal jobs + federal financial aid** — disqualifying in many cases
- **Banking** — most national banks won't process cannabis transactions, which is why most dispensaries (including ours) are cash-only

## Medical patients

Washington's medical cannabis program (RCW 69.51A) gives qualifying patients tax exemptions and access to higher purchase caps. To qualify, you need a written authorization from a healthcare provider for one of the listed conditions. The Washington DOH issues a recognition card ($1) that unlocks the tax exemption.

## How to buy

The simplest path:

1. Walk into any licensed dispensary with valid ID
2. Browse the menu (or order online ahead at our [/menu](/menu))
3. Pay cash at the counter (most dispensaries are cash-only; we have an ATM on-site)
4. Walk out with your purchase in tamper-evident packaging

That's it. No referral. No waiting period. No quota.

[Visit ${STORE.name}](/visit) · [Browse the live menu](/menu) · [First-time customer FAQ](/faq)
`,
  },
  {
    slug: "how-to-make-cannabis-cookies",
    title: "How to Make Cannabis Cookies — A Beginner's Recipe",
    description:
      "How to make cannabis cookies at home using cannabutter. Standard chocolate chip recipe + dosing math + safety guidance from a Seattle dispensary.",
    category: "Education",
    publishedAt: "2019-09-08",
    updatedAt: "2026-05-08",
    readingMinutes: 5,
    body: `Cannabis cookies are the entry-level edible — easy to make once you have cannabutter on hand, and the dose-per-cookie is straightforward to calculate. This is a standard chocolate-chip recipe with cannabutter swapped in for regular butter.

Read the [cannabutter recipe](/blog/how-to-make-cannabis-butter) first if you don't have a batch ready.

## Ingredients (makes ~20 cookies)

- **1/2 cup cannabutter** (1 stick)
- **1/2 teaspoon salt**
- **1 1/3 cup all-purpose flour**
- **1/2 teaspoon baking soda**
- **1/4 cup granulated sugar**
- **1/2 cup brown sugar (packed)**
- **2 cups chocolate chips** (semi-sweet works best)
- **1 large egg**
- **1 teaspoon vanilla** (optional)

## Directions

1. Preheat oven to **375°F**.
2. In a large bowl, cream the cannabutter with both sugars until light and fluffy.
3. Beat in the egg and vanilla.
4. In a separate bowl, whisk together flour, salt, and baking soda.
5. Add dry ingredients to wet, mixing slowly until combined. Don't overmix.
6. Fold in chocolate chips.
7. Roll dough into balls (about 1 tablespoon each), place on a parchment-lined cookie sheet, 2 inches apart.
8. Bake **10-12 minutes** until edges are golden and centers are still soft. They'll firm up as they cool.
9. Cool on the sheet for 5 minutes, then transfer to a wire rack.

## Dose math

The whole batch contains the THC from 1/2 cup (1 stick) of cannabutter. With 20 cookies in the batch:

- Per-cookie dose ≈ (total mg THC in butter ÷ 20)
- If your batch was 1/4 oz of 20% flower per pound of butter, the whole pound contains roughly 700-1,000 mg THC. 1 stick = 1/4 lb = 175-250 mg THC. **Per-cookie dose ≈ 9-12 mg.**

That's a reasonable serving for someone with edibles experience. **For a first-timer, cut a cookie in quarters and start with one quarter (~2-3 mg).**

## Safety

- Edibles peak 2-3 hours after consumption. **Wait at least 90 minutes before re-dosing.** Most overdose stories trace back to "I didn't feel anything so I ate more."
- Label the container clearly: "Cannabis cookies — keep away from kids/pets."
- Lock them up if you have kids in the house. Cookies look like normal cookies.

## What flower goes into the butter

The butter recipe doesn't care if the flower is pretty. Older flower, shake, or trim works fine — the cooking process extracts THC regardless. The flower section at ${STORE.name} carries singles, eighths, and ounce options at a range of price points; if you tell a budtender you're cooking, we'll point you at value-density options.

[Cannabutter recipe](/blog/how-to-make-cannabis-butter) · [Browse flower](/menu)
`,
  },
  {
    slug: "how-to-use-a-cannabis-pipe",
    title: "How to Use a Cannabis Pipe — Beginner's Guide",
    description:
      "How to pack, light, and smoke a cannabis pipe. Beginner walkthrough — bowl, carb, draw technique, and what to avoid.",
    category: "Education",
    publishedAt: "2019-06-22",
    updatedAt: "2026-05-08",
    readingMinutes: 4,
    body: `A pipe is the simplest way to smoke flower — fewer moving parts than a bong, less rolling skill than a joint or blunt. This walkthrough covers the basics: anatomy, packing, lighting, and the most common beginner mistakes.

## Pipe anatomy

A standard glass pipe has three parts:

- **Bowl** — the small chamber where you pack the flower.
- **Carb** — a small hole on the side of the bowl. Covering and uncovering it controls airflow (more on this below). Some pipes don't have a carb; they work fine without one.
- **Mouthpiece** — the end you inhale from.

Material matters. Glass is the standard — clean, neutral flavor, easy to inspect. Wood, ceramic, and silicone pipes work too. **Avoid aluminum** — including aluminum-foil "emergency" pipes. Aluminum vapors are not something you want in your lungs.

## How to pack a bowl

1. **Grind the flower.** Medium-coarse, not powder. A grinder helps; fingers work in a pinch.
2. **Pack the bowl.** Drop a small "screen plug" of less-broken-up flower into the bowl first to keep small pieces from pulling through. Then add ground flower on top, packing lightly. Don't over-pack — airflow needs to get through.
3. **Tap to settle.** A gentle tap evens out the surface so the cherry burns evenly.

If you skip the screen plug, expect to inhale a small piece of flower at some point. Not dangerous, just unpleasant.

## How to smoke

1. **Hold the pipe** with the bowl tilted slightly toward your face, mouthpiece to your lips.
2. **Cover the carb** with a thumb (if your pipe has one).
3. **Light the corner** of the bowl while drawing in slowly. You don't need to torch the whole bowl — light a small section and let the cherry spread.
4. **Release the carb** mid-draw to clear the chamber and pull the smoke into your lungs.
5. **Exhale slowly.**

The carb release is the key technique. Holding the carb closed builds smoke in the chamber; releasing pulls it cleanly into your lungs. Without a carb, you just keep drawing and the smoke flows through.

## Common beginner mistakes

- **Packing too tight.** Smoke can't get through. Loosen up.
- **Torching the whole bowl.** "Cornering" — lighting a small section at a time — keeps the rest fresh for later hits and lets you taste the flower.
- **Inhaling too hard.** Pipes hit harder than expected. Slow, controlled draws give a cleaner experience and don't waste flower as ash.
- **Forgetting to exhale slowly.** Holding smoke in doesn't increase potency — most THC is absorbed in the first second or two. Hold-it-in is a myth.

## Cleaning

Resin builds up over time. Clean weekly if you smoke daily:

1. Soak the pipe in **isopropyl alcohol (91%)** + a tablespoon of coarse salt for 30 minutes.
2. Shake to scrub the inside.
3. Rinse with hot water. Dry completely before next use.

A clean pipe tastes like the flower it carries. A dirty pipe tastes like resin.

## Where pipes live in the menu

We don't sell pipes (Washington retail licenses are flower/concentrate/edible only — accessories are sold by separate accessory shops). The flower we carry is on [our menu](/menu). For pipes, your options are local head shops, smoke shops, or online retailers.

[Browse flower](/menu) · [How to roll a blunt](/blog/how-to-roll-a-blunt)
`,
  },
  {
    slug: "cannabis-vaporizers-explained",
    title: "Cannabis Vaporizers Explained — How They Work + What to Pick",
    description:
      "How dry-herb vaporizers, distillate carts, and live-resin vapes work. Beginner explainer + what to look for on a Seattle dispensary menu.",
    category: "Education",
    publishedAt: "2019-11-02",
    updatedAt: "2026-05-08",
    readingMinutes: 6,
    body: `Vaporizers are one of the broadest categories on a cannabis menu — and one of the most confusing for beginners. "Vape" can mean a 510-thread distillate cart, a live-resin disposable, a dry-herb tabletop unit, or a portable convection device. They all heat cannabis to release vapor without combustion, but they're built differently and they hit differently.

## How vaporizers work

Combustion (smoking flower in a pipe, joint, or bong) reaches 600-900°F. That breaks down some of the cannabinoids and terpenes you wanted in the first place, and produces tar and carbon monoxide as byproducts.

Vaporizers heat cannabis material to **325-430°F** — hot enough to release the cannabinoids and terpenes as vapor, cool enough to skip combustion. What you inhale is closer to steam than smoke.

This is the technical reality. We'll skip the comparative health framing — there isn't enough long-term study data on vapor inhalation to make absolute claims, and Washington advertising rules ([WAC 314-55-155](https://app.leg.wa.gov/wac/default.aspx?cite=314-55-155)) limit what licensed retailers can claim about health effects. The factual difference is **temperature and combustion byproducts**, not "healthy vs unhealthy."

## Categories

### 1. Dry-herb vaporizers

Heat ground flower directly. Two technologies:

- **Conduction** — flower contacts a heated surface. Faster heat-up, less even.
- **Convection** — hot air passes through the flower. Slower start, more even, generally cleaner flavor.

Sizes range from pocket-portable (PAX, Storz & Bickel Mighty) to tabletop (Volcano). Higher temperatures release more cannabinoids; lower temperatures (around 350°F) emphasize terpene flavor.

Dry-herb vapes use the same flower we sell — see the [flower menu](/menu).

### 2. Distillate cartridges (510-thread)

A small glass cartridge filled with **distilled THC oil** that screws onto a battery (the standard "510 thread"). The cartridge has a heating coil that vaporizes the oil when you draw.

**Distillate** is highly refined cannabis oil — typically 80-90% THC, with terpenes added back for flavor. Consistent, potent, and the cheapest cannabis-per-mg-THC on most menus. Flavor profile is engineered (terpenes are added in measured ratios), so different brands taste meaningfully different.

### 3. Live-resin + rosin cartridges

Same form factor as distillate carts but **the oil is extracted from fresh-frozen flower** (live resin) or pressed under heat from flower or hash (rosin). The terpene profile is preserved from the original flower, not added back.

Live resin and rosin carts cost more than distillate. The trade is flavor + a more "full-spectrum" experience for fewer mg of THC per dollar. If terpenes matter to you, this is the category.

### 4. Disposable all-in-ones

Self-contained, pre-charged, throw away when empty. Pre-filled with distillate or live-resin oil. Convenient if you don't want to deal with batteries; not refillable, so over time it's more expensive.

### 5. Concentrate vapes (e-rigs, dab pens)

Built for **concentrates** — wax, shatter, rosin — loaded by hand into a heating chamber. Higher learning curve, stronger hits, more cleanup. Not a beginner category.

## What to ask for at the counter

A budtender's first question is usually: **"Have you used vapes before?"**

If new:
- A 510-thread battery + a 0.5g distillate cart is the lowest-friction starting point. ~$30-50 total.
- Pick a cart with terpene profile you'd be curious to taste — staff can recommend by flavor (citrus, berry, gas, woody, herbal).

If experienced:
- Live resin or rosin if flavor is the priority.
- All-in-one disposables if you want to skip the battery + cart pairing.
- Higher-cannabinoid carts (THCa diamonds, full-spectrum extracts) for advanced palates.

## Storage

Cartridges store best **upright, away from heat and direct light**. Heat thins the oil; cold thickens it. Room temperature is fine.

[Browse vapes on the live menu](/menu) · [Cannabis vs dispensary 101](/blog/complete-guide-cannabis-rainier-valley)
`,
  },
  {
    slug: "how-to-make-cannabis-edibles",
    title: "How to Make Cannabis Edibles — A Beginner's Guide",
    description:
      "Make cannabis edibles at home: cannabutter and oil basics, dosing math, onset and duration, what to expect. A practical guide from a Seattle dispensary.",
    category: "Education",
    publishedAt: "2019-07-15",
    updatedAt: "2026-05-08",
    readingMinutes: 6,
    body: `Edibles are cannabis you eat or drink rather than smoke. The mechanism is different — your liver metabolizes THC into 11-hydroxy-THC, which has a longer onset, longer duration, and a different feel than inhaled cannabis. This guide is the umbrella tutorial for making your own at home.

Specific recipes: [cannabutter](/blog/how-to-make-cannabis-butter) · [cannabis cookies](/blog/how-to-make-cannabis-cookies)

## How edibles differ from smoking flower

| Trait | Smoked flower | Edibles |
|---|---|---|
| Onset | 5-10 minutes | 60-90 minutes (sometimes 2 hours) |
| Peak | 30 minutes | 2-3 hours |
| Duration | 1-2 hours | 4-8 hours |
| Dose feel | Predictable, fades fast | Slow build, longer plateau |

The slower onset is where most overdose stories start: someone takes a dose, doesn't feel anything at 30 minutes, takes another, then both kick in at hour 2. **Wait at least 90 minutes before re-dosing.** That's the rule.

## The base ingredient: cannabutter (or cannabis oil)

Most homemade edibles start with **cannabutter** (cannabis-infused butter) or **cannabis oil** (coconut, olive, or canola oil with cannabis simmered in). Once you have a batch, swap it 1:1 for regular butter or oil in any recipe — brownies, cookies, sauces, salad dressings.

The full butter recipe lives at [how-to-make-cannabis-butter](/blog/how-to-make-cannabis-butter). The shortened version:

1. **Decarb** flower at 240°F for 40 minutes (activates THC).
2. **Simmer** with butter + water on low heat for 2-3 hours.
3. **Strain** through cheesecloth, refrigerate overnight, lift the butter disc off.

Cannabis oil follows the same process — substitute oil for butter in step 2.

## Dose math

The dose math is identical regardless of recipe:

1. **Total THC in your flower** = grams × (THC% × 10). E.g., 7g of 20% flower = 7 × 200 = 1,400 mg theoretical max.
2. **Real-world extraction** is 50-70% of theoretical with a home simmer. Call it 60% to be safe.
3. **Total THC in your butter batch** = step 1 × 0.60.
4. **Per-serving dose** = step 3 ÷ servings per recipe.

Example: 7g of 20% flower simmered into 1 lb butter, used to make 24 brownies:
- 1,400 × 0.60 = 840 mg THC in the whole pound
- 840 ÷ 24 = **35 mg per brownie** (cut in half for ~17 mg, into quarters for ~9 mg)

For a first-timer: **start at 2.5-5 mg.** You can always eat more at the 90-minute mark; you can't undo eating too much.

## What flower to use

The cooking process doesn't care if the flower is pretty. Older flower, shake, or trim works fine — extraction is the same. The flower section at ${STORE.name} carries singles, eighths, and ounce options at value pricing for cooking; tell a budtender you're making edibles and we'll point you at density-per-dollar options.

## What if it goes wrong

Too much THC at once is uncomfortable but not dangerous. Symptoms: anxiety, racing heart, paranoia, dry mouth, drowsiness. The classic remedies:

- **Hydrate.** Sip water, not chug.
- **Find a safe place.** Couch, blanket, dim lights.
- **Eat something.** A real meal helps absorption normalize.
- **CBD if you have it.** A 1:1 CBD:THC tincture can take the edge off.
- **Sleep.** Most uncomfortable peaks pass during sleep.

It will pass. Edibles overload is over within 4-8 hours. If anyone is in genuine medical distress (chest pain, can't breathe, etc.), call 911 — but the vast majority of "I ate too much" experiences are uncomfortable, not dangerous.

[Cannabutter recipe](/blog/how-to-make-cannabis-butter) · [Cookies recipe](/blog/how-to-make-cannabis-cookies) · [Edibles dosing guide](/blog/edibles-dosing-honest-guide)
`,
  },
  {
    slug: "lighting-cannabis-flower",
    title: "Lighting Cannabis Flower — Lighters, Hemp Wicks, Matches",
    description:
      "How to light cannabis flower in a pipe or joint: butane lighters, hemp wicks, matches, torches, and what to avoid.",
    category: "Education",
    publishedAt: "2019-04-03",
    updatedAt: "2026-05-08",
    readingMinutes: 3,
    body: `The flame you use to light cannabis affects the flavor — and the smaller details matter more than people expect. This is a quick guide to the four common options.

## Butane lighters

The default. Bic, Clipper, Zippo (filled with butane, not naphtha). Cheap, reliable, available at every gas station.

Two notes:
- **Hold the flame above the flower, not directly on it.** Touching flame to flower scorches the surface and produces harsh smoke. The cherry should catch from radiant heat.
- **Many smokers prefer to "corner" the bowl** — light just one section so the rest stays fresh for later hits. Pulls cleaner and tastes better.

## Hemp wicks

A length of cotton or hemp cord coated in beeswax. Light one end, then use the slow-burning wick to light bowls or joints. The reason people use them is taste — beeswax is closer to the flower flavor than butane, and the burn temperature is gentler.

How to use:
1. Light one end of the wick from a regular lighter (you need to spark it once).
2. Hold the wick to the bowl or joint at an angle, drawing slowly.
3. Tilt down to put it out, or wait for it to self-extinguish (it will after a minute if left alone).
4. The wax can drip — don't set a lit wick on fabric or paper.

Hemp wicks live in head shops or online. Most cannabis dispensaries (including ${STORE.name}) don't sell accessories under Washington retail license rules.

## Matches

Wooden matches work. Sulfur tip burns off in the first second; let it die down before bringing the match to your bowl. Cardboard matches are fine for joints but tend to burn out fast on a bowl.

Practical: matches taste cleaner than butane to most palates, but they're slow and you'll go through a book quickly.

## Torches (for concentrates / dabs)

Butane torches (the kind you'd use for crème brûlée) are the standard for dab rigs and concentrate vapes that use a glass nail. **Not for flower** — too hot, burns through the bowl in a flash.

A torch's flame is 2,000°F+; flower combusts cleanly at 600-900°F. Mismatching them just wastes flower.

## What to avoid

- **Aluminum-foil "emergency" pipes.** Don't. Aluminum vapor isn't something you want in your lungs. If you're improvising, an apple pipe works.
- **Plastic lighters held inverted.** A few brands of cheap lighters can leak fluid when held upside-down — easy to scorch fingers + the flower.
- **Car cigarette lighters** for bowl-lighting. They can spark a joint or hemp wick fine, but they don't reach the flower.

## TL;DR

If you want simple: butane lighter, light from above, corner the bowl. If you want flavor: hemp wick. If you want clean and slow: matches. If you're hitting concentrates: torch.

[Browse the live flower menu](/menu) · [How to use a cannabis pipe](/blog/how-to-use-a-cannabis-pipe)
`,
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function getPosts(): Post[] {
  return [...POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
