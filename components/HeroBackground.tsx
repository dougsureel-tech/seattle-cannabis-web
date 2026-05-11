/**
 * HeroBackground — animated background for the homepage hero.
 *
 * Pure CSS, zero JS, zero deps. Composed of three layers, in z-order back→front:
 *
 *   1. Base brand gradient (indigo-950 → violet-950 → indigo-950) — the same
 *      bookend the footer / AnnouncementBar / hours card already use. The hero
 *      is the most expressive instance of that identity, not a different one.
 *
 *   2. Three drifting radial "pools" (indigo wash, indigo top-right, fuchsia
 *      bottom-right) — same composition the static version had, but each pool
 *      is its own absolutely-positioned div with a slow `transform: translate`
 *      keyframe (18s / 22s / 20s, all out-of-phase so the mesh never repeats
 *      a frame inside the visible cycle). GPU-composited; no layout/paint.
 *
 *   3. A faint dot-grid (white 1px @ 28px) — held over from the static design
 *      because it gives the layered washes a subtle texture to land on. Kept
 *      static; animating it is the kind of motion that catches the eye and
 *      breaks the "subtle" rule.
 *
 *   4. Two corner "blobs" (indigo TR, fuchsia BL) — same pieces the static
 *      version had. Now they have a slow scale + translate breathe (24s)
 *      so the corner glow feels alive without anything moving fast enough
 *      to be noticed in a 5-second glance.
 *
 *   5. Three sparse "particles" — soft 240px radial-gradient blobs in
 *      indigo/violet/fuchsia, drifting on independent paths over 30-40s.
 *      They're large, low-opacity, and slow — they read as ambient depth,
 *      not as "particles." Three is enough; more reads as busy.
 *
 * Performance notes:
 *   - All animation is `transform` + `opacity` on absolutely-positioned divs.
 *     No `background-position` animation (causes paint), no `filter: blur`
 *     animation (causes filter re-rasterization on each frame).
 *   - `will-change: transform` is set on the animated layers so the compositor
 *     promotes them once instead of every frame.
 *   - `pointer-events: none` on every layer so the hero content (CTAs etc.)
 *     above receives all clicks unimpaired.
 *
 * Accessibility:
 *   - All animations are gated behind a `@media (prefers-reduced-motion: no-preference)`
 *     block so users with reduced-motion preferences get the static composition
 *     (which already looks great — that was the previous design).
 *
 * Tab-hidden / off-screen:
 *   - Browsers automatically throttle CSS transform animations on hidden tabs
 *     and off-screen elements (compositor-only animations don't tick if the
 *     layer isn't being composited). No JS IntersectionObserver needed for
 *     pure-CSS keyframes.
 */
export function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      // content-visibility:auto lets the compositor skip rendering this layer
      // when scrolled offscreen — low-end mobile scroll FPS +5-10 per
      // vercel:performance-optimizer P3 finding. Safe because HeroBackground
      // is absolute inset-0 over the hero <section>; the section's height
      // doesn't depend on this layer's render state, so no CLS from
      // content-visibility's default zero-size-when-skipped behavior.
      className="hero-bg pointer-events-none absolute inset-0 overflow-hidden [content-visibility:auto]"
    >
      {/* Layer 1 — base brand gradient. Static. */}
      <div className="hero-bg__base absolute inset-0" />

      {/* Layer 2 — three drifting radial pools. */}
      <div className="hero-bg__pool hero-bg__pool--indigo-wash absolute inset-0" />
      <div className="hero-bg__pool hero-bg__pool--indigo-tr absolute inset-0" />
      <div className="hero-bg__pool hero-bg__pool--fuchsia-br absolute inset-0" />

      {/* Layer 3 — static dot grid texture. */}
      <div className="hero-bg__grid absolute inset-0" />

      {/* Layer 4 — two corner blobs that slowly breathe. */}
      <div className="hero-bg__blob hero-bg__blob--tr absolute" />
      <div className="hero-bg__blob hero-bg__blob--bl absolute" />

      {/* Layer 5 — three sparse drifting particles. */}
      <div className="hero-bg__particle hero-bg__particle--a absolute" />
      <div className="hero-bg__particle hero-bg__particle--b absolute" />
      <div className="hero-bg__particle hero-bg__particle--c absolute" />
    </div>
  );
}
