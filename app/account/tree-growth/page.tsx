// /account/tree-growth — C2 of
// /CODE/Green Life/PLAN_STRAIN_TREE_INNOVATION_2026_05_21.md.
//
// Customer-facing surface for the 15-second time-lapse share video.
// Mounts at /account/tree-growth as the plan specifies.
//
// Feature flag: TREE_TIMELAPSE_ENABLED. Default OFF — surface returns
// notFound() when unset so it's invisible until Doug flips it on per
// Vercel env in scc + glw projects.
//
// Mock-data mode: reads from lib/tree-timelapse-mock until verified-
// purchase ships in Phase 1A of strain-pages-V2. The one-line swap
// recipe is documented inside lib/tree-timelapse-mock.ts.
//
// WAC posture: process + experience vocabulary only. Customer's
// display name on share card, no photos of people, no efficacy claims.

import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getOrCreatePortalUser } from "@/lib/portal";
import {
  buildTimelapseFrames,
  type PurchaseTimelineEntry,
} from "@/lib/tree-timelapse";
import { mockPurchaseTimeline } from "@/lib/tree-timelapse-mock";
import { TreeTimelapseExporter } from "@/components/TreeTimelapseExporter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Strain Journey",
  // 21+ regulated surface + customer-personal data — keep out of indexes.
  robots: { index: false, follow: false },
};

export default async function TreeGrowthPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  // ?preview=1 escape — sister glw v38.365. Doug eyes mock fixture without
  // login before flipping TREE_TIMELAPSE_ENABLED.
  const { preview } = await searchParams;
  const previewMode = preview === "1" || preview === "true";

  // Feature-flag gate FIRST — Doug-flipped per Vercel env, default OFF.
  // Preview-mode escape lets Doug see the page even when the flag is OFF.
  if (process.env.TREE_TIMELAPSE_ENABLED !== "true" && !previewMode) {
    notFound();
  }

  // Customer-only surface — preview mode skips Clerk + portalUser lookup
  // and renders with a neutral display name.
  let portalDisplayName = "friend";
  if (!previewMode) {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in?redirect_url=/account/tree-growth");

    const user = await currentUser();
    const portalUser = await getOrCreatePortalUser(
      userId,
      user?.emailAddresses[0]?.emailAddress,
      user?.fullName,
    );
    portalDisplayName =
      user?.firstName?.trim() ||
      portalUser?.name?.trim().split(/\s+/)[0] ||
      "friend";
  }

  // Mock-data mode — see lib/tree-timelapse-mock for the swap recipe.
  // When verified-purchase ships, this line becomes:
  //   const timeline = await getCustomerPurchaseTimeline(portalUser.id);
  const timeline: readonly PurchaseTimelineEntry[] = mockPurchaseTimeline();
  const sequence = buildTimelapseFrames(timeline, { durationSec: 15 });

  const displayName = portalDisplayName;

  const visitCount = timeline.length;
  const distinctStrainCount = sequence.nodes.length;

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/account"
          className="text-sm text-indigo-300 hover:text-indigo-200 underline-offset-2"
        >
          ← Back to your account
        </Link>
      </div>

      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Your strain journey</h1>
        <p className="text-slate-300">
          A 15-second time-lapse of the strains you've tried at Seattle Cannabis Co.,
          filling in chronologically by purchase date. Built from your receipt-verified
          history — share it however you like.
        </p>
      </header>

      <section aria-label="Tree-growth animation and export controls">
        <TreeTimelapseExporter
          displayName={displayName}
          yearRange={sequence.yearRange}
          visitCount={visitCount}
          distinctStrainCount={distinctStrainCount}
        />
      </section>

      <section className="mt-10 rounded-lg border border-indigo-500/20 bg-slate-950/40 p-4 text-sm text-slate-300">
        <h2 className="font-semibold text-indigo-200 mb-2">What's this?</h2>
        <p className="mb-2">
          Every strain you've bought here lights up on the tree in the order you tried it.
          Strains you came back to grow a little each time you visit. The tree IS the share
          card — open the share view above and screen-record from your phone, or use the
          Download button to save a video to your device.
        </p>
        <p className="opacity-80">
          Preview-mode runs from a sample purchase history while we finish wiring real
          purchase data. The look + feel matches the final shipping render — only the
          underlying purchase list will swap.
        </p>
      </section>

      <p className="mt-6 text-xs text-slate-500">
        WA state · 21+ only · process and experience only ·
        no medical or efficacy claims · WAC 314-55-155 compliant
      </p>
    </main>
  );
}
