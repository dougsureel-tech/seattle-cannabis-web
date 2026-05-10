import type { Metadata } from "next";
import { STORE, DEFAULT_OG_IMAGE} from "@/lib/store";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";
import { safeJsonLd } from "@/lib/json-ld-safe";

// BreadcrumbList JSON-LD — sister of glw v12.605 + cannagent v3.391
// 100% indexable coverage. Pre-fix /apply had no BreadcrumbList;
// Google could not show the breadcrumb chip in SERP results.
const breadcrumb = breadcrumbJsonLd([
  { name: "Home", url: STORE.website },
  { name: "Apply", url: `${STORE.website}/apply` },
]);

// /apply has its own layout because `app/apply/page.tsx` is a client
// component (`"use client"` for the multi-step form state). Client
// components can't export `metadata`, so without this layout the page
// inherits the root layout's canonical (`/`) — Google then treats
// /apply as a duplicate of the homepage and refuses to index it as a
// separate page. Anyone Googling "Seattle Cannabis Co apply for job"
// would not find /apply in search results. /careers (sister page) is
// a server component and exports its own metadata; this layout makes
// /apply match the same canonical posture.

export const metadata: Metadata = {
  // Drop ${STORE.name} from body — title.template appends brand suffix
  // so the body baking it in creates duplicate. Sister glw same-push +
  // GW v2.94.60. Caught by /loop tick 25 duplicate-brand sweep.
  title: "Apply for a Job",
  // Trim 173 → 158 chars: drop verbose "in Seattle WA" + "general intake" +
  // shorten role list. Caught 2026-05-10 by /loop deep desc sweep.
  description: `Apply for a position at ${STORE.name}, ${STORE.neighborhood}. Budtender, lead, inventory + more — open roles. 21+ required (WAC 314-55-115).`,
  alternates: { canonical: "/apply" },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: `Apply to work at ${STORE.name}`,
    description: `Open roles + general intake at ${STORE.name}, ${STORE.neighborhood} Seattle. 21+ required.`,
    url: `${STORE.website}/apply`,
    siteName: STORE.name,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `Apply to work at ${STORE.name}`,
    description: `Open roles + general intake at ${STORE.name}, ${STORE.neighborhood} Seattle.`,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumb) }}
      />
      {children}
    </>
  );
}
