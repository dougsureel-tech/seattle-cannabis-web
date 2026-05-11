import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { safeJsonLd } from "@/lib/json-ld-safe";

export const dynamic = "force-static";

export const metadata: Metadata = {
  // title.absolute drops template suffix `| Seattle Cannabis Co.` so this
  // page stays under Google's ~60-char SERP cap. Pre-fix was 61 chars from
  // the `&` HTML-encoded as `&amp;` inflating the rendered <title>. Caught
  // 2026-05-10 by /loop deep title sweep. Sister glw v13.705 same-class.
  title: { absolute: "Accessibility & Health Info — Seattle Cannabis Co." },
  description: `Accessibility statement, ADA accommodations, and Washington-state cannabis health information for ${STORE.name} in ${STORE.address.city}, WA.`,
  alternates: { canonical: "/accessibility" },
};

// Accessibility + informed-consent surface for Seattle Cannabis Co.
// Mirrors greenlife-web's /accessibility (same WA statutory warning, same
// WCAG 2.1 AA framing, same nine health-info cards) with Seattle-specific
// physical-store details: Rainier Ave entrance, Link light-rail proximity,
// Mt Baker / Columbia City context, indigo palette throughout.

const PHYSICAL_AMENITIES = [
  {
    title: "Parking",
    body: "Free off-street parking at 7266 Rainier Ave S, including a striped accessible space at the front. Curb cut to the entrance, no steps from the lot to the door.",
  },
  {
    title: "Public transit",
    body: "Mt Baker (~6 min walk) and Columbia City (~10 min walk) Link light-rail stations are both step-free. The 7 bus runs Rainier Ave S directly past us with a stop in front of the building.",
  },
  {
    title: "Entrance",
    body: "Single-leaf glass door, level threshold, ~36 inches clear width. The lobby ID-check counter is wheelchair-accessible.",
  },
  {
    title: "Inside the shop",
    body: "Wide aisles between cases. The point-of-sale counter has a lowered section. Staff will hand you product on request — you do not have to reach over a tall case to inspect it.",
  },
  {
    title: "Service animals",
    body: "Service animals are welcome. Per ADA, only two questions allowed: (1) is the animal required because of a disability, (2) what work or task is the animal trained to perform. We do not ask for documentation.",
  },
  {
    title: "Communication accommodations",
    body: "Staff are happy to write product info on a notepad, repeat slowly, or step outside with you for a quieter conversation. No ASL interpreter on staff — call ahead at " +
      STORE.phone +
      " and we'll arrange a video-relay session for your visit.",
  },
];

const WEB_A11Y_NOTES = [
  "Keyboard navigation: every interactive element is reachable via Tab and operable via Enter / Space.",
  "Focus indicator: an indigo outline appears around any element you tab to, so you can always see where you are on the page (WCAG 2.4.7).",
  "Screen reader: pages use semantic HTML, ARIA labels on icon-only buttons, and a skip-to-main link at the top of every page.",
  "Loading states: when a page is loading, the spinner announces 'Loading' to screen readers so the page never feels unresponsive (WCAG 4.1.3).",
  "Visual contrast: body copy is 4.5:1 or better against its background; large headings are 3:1 or better.",
  "Motion: animations respect prefers-reduced-motion. The home-page hero, /deals card hover, and pin pulses all dim or stop when the OS-level reduce-motion preference is set.",
  "Image alt text: product photos use descriptive alt; decorative imagery is marked aria-hidden so screen readers skip it.",
  "Forms: every input has an associated label; error messages reference the field by name.",
];

const HEALTH_WARNINGS = [
  {
    heading: "Cannabis is for adults 21 and over.",
    body: "WSLCB-licensed retail in Washington is restricted to adults 21+ with a valid government-issued ID. We card every transaction, every time — no exceptions.",
  },
  {
    heading: "Do not drive or operate machinery.",
    body: "Cannabis can impair judgment, reaction time, and motor coordination. Effects can persist for hours after consumption. WA law treats cannabis-impaired driving as a DUI, with the same legal consequences as alcohol.",
  },
  {
    heading: "Pregnancy and nursing.",
    body: "Cannabis use during pregnancy is associated with risks to fetal development. THC and other cannabinoids transfer through breast milk. The Washington State Department of Health advises against any cannabis use during pregnancy, while attempting to become pregnant, or while breastfeeding.",
  },
  {
    heading: "Edibles take longer than you think.",
    body: "Onset can take 30 minutes to 2 hours, and effects last several hours. Start low (2.5–5 mg THC), go slow, and do not redose during the wait. Most over-consumption events are first-time edible users redosing too soon.",
  },
  {
    heading: "Medications and medical conditions.",
    body: "Cannabis can interact with prescription medications including blood thinners (warfarin), some antidepressants, and certain heart and blood-pressure medications. People with cardiovascular disease, schizophrenia, or psychotic disorders face elevated risk. If you have a medical condition or take prescription medication, talk to your healthcare provider before using cannabis.",
  },
  {
    heading: "Mental health.",
    body: "High-THC products can trigger or worsen anxiety, panic, and paranoia, especially in people with no prior cannabis experience. Higher doses do not produce stronger relief — they often produce the opposite. If you start to feel unwell, stop using, hydrate, and ride it out somewhere calm.",
  },
  {
    heading: "Storage and child safety.",
    body: "Store cannabis in a locked, child-proof container, away from food and children. Edibles in particular can look identical to non-cannabis snacks. Keep them in their original WA-WSLCB-compliant packaging.",
  },
  {
    heading: "If you over-consume.",
    body: "Cannabis is not associated with fatal overdose, but a difficult experience can feel medical. Stay calm, find a quiet space, hydrate, and let it pass — typically 2–6 hours. If symptoms include chest pain, sustained vomiting, or loss of consciousness, call 911 or the Washington Poison Center at 1-800-222-1222.",
  },
];

const STATUTORY_NOTICE = `WAC 314-55-082 health warning: Marijuana can impair concentration, coordination, and judgment. Do not operate a vehicle or machinery under the influence of this drug. There may be health risks associated with consumption of this product. For use only by adults twenty-one and older. Keep out of the reach of children.`;

export default function AccessibilityPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${STORE.website}/accessibility#faq`,
    mainEntity: HEALTH_WARNINGS.map((w) => ({
      "@type": "Question",
      name: w.heading,
      acceptedAnswer: { "@type": "Answer", text: w.body },
    })),
  };

  // T96 sister of glw v19.605.
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${STORE.website}/accessibility#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Accessibility", item: `${STORE.website}/accessibility` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-stone-50">
        <section className="relative bg-gradient-to-br from-indigo-800 via-indigo-900 to-violet-950 text-white overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1.5px, transparent 1.5px)",
              backgroundSize: "30px 30px",
            }}
          />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <p className="text-indigo-200/80 text-[11px] font-bold uppercase tracking-[0.22em]">
              Customer Resources
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.05]">
              Accessibility &amp; Health Information
            </h1>
            <p className="mt-4 max-w-2xl text-indigo-100/80 leading-relaxed">
              How we accommodate customers in our shop on Rainier Ave, how we keep this
              site usable for everyone, and what Washington-state law and the Department of Health
              want you to know before using cannabis.
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
          <aside
            role="note"
            aria-label="Statutory cannabis health warning"
            className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 sm:p-6 text-stone-900"
          >
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-800">
              Washington State Health Warning · WAC 314-55-082
            </p>
            <p className="mt-2 text-sm sm:text-base leading-relaxed">{STATUTORY_NOTICE}</p>
          </aside>

          <section className="space-y-5">
            <header>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                In our shop
              </h2>
              <p className="mt-1.5 text-stone-600 text-sm sm:text-base">
                ADA Title III accommodations for the physical store at {STORE.address.full}.
              </p>
            </header>
            <ul className="grid sm:grid-cols-2 gap-4">
              {PHYSICAL_AMENITIES.map((a) => (
                <li
                  key={a.title}
                  className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-sm font-extrabold text-stone-900">{a.title}</p>
                  <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">{a.body}</p>
                </li>
              ))}
            </ul>
            <p className="text-sm text-stone-600 leading-relaxed">
              Need an accommodation we have not listed? Email{" "}
              <a
                href={`mailto:${STORE.email}?subject=Accessibility%20accommodation`}
                className="font-semibold text-indigo-800 underline underline-offset-2 hover:text-indigo-600"
              >
                {STORE.email}
              </a>{" "}
              or call{" "}
              <a
                href={`tel:${STORE.phoneTel}`}
                className="font-semibold text-indigo-800 underline underline-offset-2 hover:text-indigo-600"
              >
                {STORE.phone}
              </a>
              . Tell us what you need and we&apos;ll set it up before you come in.
            </p>
          </section>

          <section className="space-y-5">
            <header>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                On this website
              </h2>
              <p className="mt-1.5 text-stone-600 text-sm sm:text-base">
                We build to{" "}
                <a
                  href="https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_overview&amp;levels=a%2Caa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-indigo-800 underline underline-offset-2 hover:text-indigo-600"
                >
                  WCAG 2.1 Level AA
                </a>{" "}
                across every page.
              </p>
            </header>
            <ul className="space-y-2.5">
              {WEB_A11Y_NOTES.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-3 text-sm text-stone-700 leading-relaxed"
                >
                  <span aria-hidden className="text-indigo-700 mt-0.5">
                    ✓
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-extrabold text-stone-900">Found a barrier?</p>
              <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">
                Email{" "}
                <a
                  href={`mailto:${STORE.email}?subject=Web%20accessibility%20issue`}
                  className="font-semibold text-indigo-800 underline underline-offset-2 hover:text-indigo-600"
                >
                  {STORE.email}
                </a>{" "}
                with the page URL and what blocked you. We respond within two business days and
                fix verified issues on the next deploy.
              </p>
            </div>
          </section>

          <section className="space-y-5">
            <header>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                Cannabis health information
              </h2>
              <p className="mt-1.5 text-stone-600 text-sm sm:text-base">
                Practical guidance for adults using legal cannabis in Washington. Sourced from{" "}
                <a
                  href="https://doh.wa.gov/you-and-your-family/cannabis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-indigo-800 underline underline-offset-2 hover:text-indigo-600"
                >
                  WA Department of Health
                </a>{" "}
                guidance and WSLCB consumer materials.
              </p>
            </header>
            <ul className="space-y-3.5">
              {HEALTH_WARNINGS.map((w) => (
                <li
                  key={w.heading}
                  className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-base font-extrabold text-stone-900">{w.heading}</p>
                  <p className="mt-1.5 text-sm text-stone-700 leading-relaxed">{w.body}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-lg font-extrabold text-stone-900 tracking-tight">
              If you need help right now
            </h2>
            <ul className="text-sm text-stone-700 space-y-1.5">
              <li>
                <span className="font-semibold">Washington Poison Center:</span>{" "}
                <a href="tel:18002221222" className="text-indigo-800 underline underline-offset-2">
                  1-800-222-1222
                </a>{" "}
                · 24 hours a day
              </li>
              <li>
                <span className="font-semibold">988 Suicide &amp; Crisis Lifeline:</span>{" "}
                <a href="tel:988" className="text-indigo-800 underline underline-offset-2">
                  988
                </a>{" "}
                · call or text
              </li>
              <li>
                <span className="font-semibold">SAMHSA National Helpline:</span>{" "}
                <a href="tel:18006624357" className="text-indigo-800 underline underline-offset-2">
                  1-800-662-HELP (4357)
                </a>{" "}
                · free, confidential
              </li>
              <li>
                <span className="font-semibold">In a medical emergency:</span> 911
              </li>
            </ul>
          </section>

          <footer className="text-center pt-4 pb-2">
            <Link
              href="/"
              className="text-sm font-semibold text-indigo-800 hover:text-indigo-600 transition-colors"
            >
              ← Back to home
            </Link>
          </footer>
        </div>
      </div>
    </>
  );
}
