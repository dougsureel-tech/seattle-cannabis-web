"use client";

// NeighborhoodMap — full-width interactive South Seattle map below the hero.
//
// Eight neighborhood pins + the shop pin rendered on a stylized SVG.
// Hover/tap a pin → highlight + popover (drive time, walk time, transit
// option, neighborhood deal-of-the-day, "Get directions from here" CTA).
// Sidebar lists the same eight neighborhoods so keyboard / screen-reader
// users get the full list without driving the SVG.
//
// On screens narrower than ~640px the SVG would be a postage-stamp, so
// mobile gets a stacked card list with the same data + same CTAs. Same
// component, different layout — no duplicated content.
//
// Future-agent seam — analytics + retargeting:
//   The map sets `localStorage.sc_last_neighborhood` whenever a customer
//   activates a pin. Future Pixel snippets (Meta, Google Ads, klaviyo)
//   can read this for segmentation and fire a `NeighborhoodView` custom
//   event from the same handler:
//     window.fbq?.('trackCustom', 'NeighborhoodView', { neighborhood });
//     window.gtag?.('event', 'neighborhood_view', { neighborhood });
//   Look for the // PIXEL_SEAM marker below.
//
// No Mapbox / Google Maps embed — keeps the page fast, no API key, no
// privacy hit.

import { useEffect, useMemo, useRef, useState } from "react";
import { NEIGHBORHOODS, SHOP_PIN, directionsUrl, type Neighborhood } from "@/lib/neighborhoods";
import { dealForNeighborhood, type NeighborhoodDeal } from "@/lib/neighborhood-deals";

// Approximate Light Rail station coordinates on the 0–100 stylized canvas.
// Mt Baker → Columbia City → Othello matches the actual N-S Link sequence
// south of downtown; the dotted line in MapSvg traces through these points.
const LINK_STATIONS = [
  { id: "mt-baker", name: "Mt Baker", x: 53, y: 22 },
  { id: "columbia-city", name: "Columbia City", x: 51, y: 35 },
  { id: "othello", name: "Othello", x: 50, y: 50 },
] as const;

type Props = {
  /** Full destination address (e.g. "7266 Rainier Ave S, Seattle, WA 98118"). */
  destinationAddress: string;
  /** Top-level deal short label, used as fallback when a neighborhood isn't tagged. */
  fallbackDealShort: string | null;
};

const STORAGE_KEY = "sc_last_neighborhood";

export function NeighborhoodMap({ destinationAddress, fallbackDealShort }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  // prefers-reduced-motion gate for the pin entrance stagger + the shop-pin
  // pulse. Read once on mount so we don't churn re-renders if the user
  // toggles the OS setting mid-session (rare). Falls back to false (motion
  // on) when matchMedia isn't available — SSR + ancient browsers.
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
  }, []);

  // Memoize the per-neighborhood deal lookup so the sidebar can render the
  // same 🔥 marker the map pin shows (keyboard a11y + visual parity).
  const dealMap = useMemo(() => {
    const m = new Map<string, NeighborhoodDeal | null>();
    for (const n of NEIGHBORHOODS) {
      m.set(n.id, dealForNeighborhood(n.id));
    }
    return m;
  }, []);

  // Esc closes the popover; also clears focus so a re-tab doesn't land
  // back on the same pin. Mounted-only so SSR matches initial markup.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && active) {
        setActive(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  // Outside-click closes popover. Pin clicks live inside the SVG so a click
  // outside both the SVG and the popover panel is the "dismiss" gesture.
  useEffect(() => {
    if (!active) return;
    function onClick(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-neighborhood-pin]") && !t.closest("[data-neighborhood-popover]")) {
        setActive(null);
      }
    }
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [active]);

  function activate(id: string) {
    setActive(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // private mode / quota — silently ignore. Storage is opportunistic.
    }
    // PIXEL_SEAM — Meta/Google Ads/Klaviyo NeighborhoodView event fires here
    // once pixels are loaded. Pin DOM nodes also carry data-neighborhood for
    // tag-manager rule-based capture if Doug wires GTM later.
    // window.fbq?.('trackCustom', 'NeighborhoodView', { neighborhood: id });
    // window.gtag?.('event', 'neighborhood_view', { neighborhood: id });
  }

  const activeNeighborhood = active ? NEIGHBORHOODS.find((n) => n.id === active) : null;
  const activeDeal = active ? dealForNeighborhood(active) : null;

  return (
    <section
      className="relative bg-gradient-to-b from-white via-indigo-50/40 to-white border-b border-stone-100"
      aria-labelledby="neighborhood-map-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
            Closest shop in South Seattle
          </p>
          <h2
            id="neighborhood-map-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight mt-2"
          >
            Pick your block. We&apos;re right there.
          </h2>
          <p className="text-stone-600 mt-3 text-base max-w-2xl mx-auto leading-relaxed">
            Rainier Valley to Rainier Beach, Beacon Hill to Seward Park — tap your spot to see
            drive time, the Link, and what&apos;s good at the counter today.
          </p>
        </div>

        {/* Desktop: SVG map + sidebar. Mobile: stacked cards. */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Map column — 8/12 on desktop. */}
          <div className="sm:col-span-8 relative">
            <div className="rounded-3xl overflow-hidden border border-indigo-100 bg-gradient-to-br from-indigo-950 via-violet-950 to-indigo-950 shadow-xl shadow-violet-900/20 relative">
              {/* Inline keyframes scoped to this map only — pin entrance
                  stagger + shop-pin slow pulse. Inline so the map ships
                  with everything it needs without globals.css surface
                  growing per-component. prefers-reduced-motion is handled
                  in JS (reduceMotion flag short-circuits delays). */}
              <style>{`
                @keyframes pin-enter {
                  from { opacity: 0; transform: translateY(2px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                @keyframes shop-pin-pulse {
                  0%, 100% { opacity: 0.45; transform: scale(1); transform-origin: ${SHOP_PIN.x}% ${SHOP_PIN.y}%; }
                  50% { opacity: 0.1; transform: scale(1.35); transform-origin: ${SHOP_PIN.x}% ${SHOP_PIN.y}%; }
                }
                .shop-pin-pulse { animation: shop-pin-pulse 3.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
                @media (prefers-reduced-motion: reduce) {
                  .shop-pin-pulse { animation: none; opacity: 0.35; }
                  [data-neighborhood-pin] { animation: none !important; }
                }
              `}</style>
              <MapSvg active={active} onActivate={activate} reduceMotion={reduceMotion} />

              {/* Map legend — bottom-left chip cluster. Light Rail swatch
                  flipped from amber → indigo to match the new dotted
                  indigo Link line; deal swatch added so the 🔥 / amber-dot
                  badge on a pin reads as "deal of the day" without a
                  tooltip. */}
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 max-w-[80%]">
                <Legend swatch="bg-fuchsia-400" label="Our shop" />
                <Legend swatch="bg-indigo-300" label="Neighborhood" />
                <Legend swatch="bg-indigo-200" label="Light Rail" />
                <Legend swatch="bg-amber-400" label="Deal today" />
              </div>
            </div>

            {/* Popover anchored to the map column. Mounts under the map so the
                desktop layout doesn't shift; positioned absolutely on the
                desktop SVG so it lives over the canvas like a real map info
                pane. */}
            {activeNeighborhood && (
              <div
                ref={popoverRef}
                data-neighborhood-popover
                role="dialog"
                aria-labelledby={`popover-${activeNeighborhood.id}-name`}
                className="mt-4 lg:mt-0 lg:absolute lg:top-4 lg:left-4 lg:right-4 lg:max-w-md rounded-2xl bg-white border border-indigo-200 shadow-2xl shadow-indigo-900/20 p-5 z-10"
              >
                <PopoverContent
                  neighborhood={activeNeighborhood}
                  deal={activeDeal}
                  fallbackDealShort={fallbackDealShort}
                  destinationAddress={destinationAddress}
                  onClose={() => setActive(null)}
                />
              </div>
            )}
          </div>

          {/* Sidebar — 4/12 on desktop. Lists every neighborhood as a
              clickable row; the SVG is just an alternate way to reach the
              same data. Typography bumped: name from text-sm → text-base,
              transit from text-xs → text-[13px], and a "Deal today" pill
              appears on rows whose neighborhood has a deal-of-the-day so
              the keyboard / sidebar path matches the map pin badge. */}
          <ul className="sm:col-span-4 space-y-2" aria-label="Neighborhoods we serve">
            {NEIGHBORHOODS.map((n) => {
              const isActive = active === n.id;
              const hasDeal = dealMap.get(n.id) !== null && dealMap.get(n.id) !== undefined;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    data-neighborhood={n.id}
                    onClick={() => activate(n.id)}
                    aria-label={`${n.name}, ${n.driveMin} minute drive${hasDeal ? ", deal of the day available" : ""}`}
                    className={`w-full text-left rounded-2xl border px-4 py-3.5 transition-all ${
                      isActive
                        ? "border-indigo-500 bg-indigo-50 shadow-md"
                        : "border-stone-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5">
                        <span
                          className={`font-extrabold text-base tracking-tight ${isActive ? "text-indigo-900" : "text-stone-900"}`}
                        >
                          {n.name}
                        </span>
                        {hasDeal && (
                          <span
                            aria-hidden="true"
                            className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-400 ring-2 ring-amber-100 text-[9px]"
                            title="Deal of the day"
                          >
                            🔥
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] font-bold text-indigo-700 whitespace-nowrap uppercase tracking-wider">
                        {n.driveMin} min
                      </span>
                    </div>
                    <p className="text-[13px] text-stone-500 leading-snug mt-1">{n.transit}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Mobile: stacked card list (no SVG). Same data, same CTAs. */}
        <ul className="sm:hidden space-y-3">
          {NEIGHBORHOODS.map((n) => {
            const deal = dealForNeighborhood(n.id);
            return (
              <li
                key={n.id}
                data-neighborhood={n.id}
                className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-baseline justify-between gap-2 mb-1.5">
                  <h3 className="font-bold text-stone-900 text-base">{n.name}</h3>
                  <span className="text-xs font-bold text-indigo-700 whitespace-nowrap">
                    {n.driveMin} min drive
                    {n.walkMin ? ` · ${n.walkMin} min walk` : ""}
                  </span>
                </div>
                <p className="text-sm text-stone-600 leading-snug">{n.blurb}</p>
                <p className="text-xs text-stone-500 mt-2 flex items-center gap-1.5">
                  <TransitIcon /> {n.transit}
                </p>
                {(deal || fallbackDealShort) && (
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-amber-100 to-amber-200/80 ring-1 ring-amber-300 text-amber-900 text-xs font-extrabold px-3 py-1.5">
                    <span aria-hidden="true">🔥</span>
                    {deal ? deal.short : fallbackDealShort}
                  </div>
                )}
                <a
                  href={directionsUrl(n, destinationAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => activate(n.id)}
                  className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold transition-colors"
                >
                  Get directions from {n.name} →
                </a>
              </li>
            );
          })}
        </ul>

        <p className="text-center text-xs text-stone-500 mt-8 sm:mt-10">
          Times are wall-clock from 7266 Rainier Ave S — Link Light Rail runs every 6–10 min
          through Othello Station.
        </p>
      </div>
    </section>
  );
}

// ── Subcomponents ──────────────────────────────────────────────────────────

function MapSvg({
  active,
  onActivate,
  reduceMotion,
}: {
  active: string | null;
  onActivate: (id: string) => void;
  reduceMotion: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="South Seattle neighborhood map showing Seattle Cannabis Co. and surrounding neighborhoods"
      className="w-full h-auto aspect-[4/3]"
    >
      <defs>
        {/* Subtle grid behind everything for "map" feel. */}
        <pattern
          id="map-grid"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
        >
          <path d="M6 0 L0 0 L0 6" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
        </pattern>
        {/* Lake Washington — bumped to a clearer shaded blue area on the
            east side. Two-stop gradient so the deepest blue sits on the
            water's center mass, fading into the canvas dark indigo where
            the shoreline isn't precisely defined. */}
        <linearGradient id="lake-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0" />
          <stop offset="40%" stopColor="#2563eb" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" fill="url(#map-grid)" />

      {/* Lake Washington — solid shaded area on the east side. The
          shoreline curve approximates the Seward Park peninsula bulge on
          the west bank and Mercer Island's silhouette on the east. */}
      <path
        d="M 84 0 Q 76 18 80 38 Q 88 50 78 62 Q 82 80 88 100 L 100 100 L 100 0 Z"
        fill="url(#lake-grad)"
      />
      {/* Mercer Island shoreline soft-stroke — gives the lake a hint of
          shape without overcomplicating. */}
      <path
        d="M 84 0 Q 76 18 80 38 Q 88 50 78 62 Q 82 80 88 100"
        fill="none"
        stroke="rgba(96,165,250,0.45)"
        strokeWidth="0.4"
      />
      <text
        x="89"
        y="50"
        textAnchor="middle"
        fontSize="2.4"
        fontWeight="600"
        fill="rgba(191,219,254,0.85)"
        fontStyle="italic"
        letterSpacing="0.4"
      >
        Lake Washington
      </text>

      {/* I-5 corridor — labeled gray line on the west side. Slightly
          curved (US-5 doesn't run a perfect N-S in South Seattle) and
          drawn with the freeway-style thicker stroke + a thinner inner
          stroke for the lane-divider feel. */}
      <path
        d="M 8 0 Q 10 30 6 55 Q 4 80 9 100"
        fill="none"
        stroke="rgba(148,163,184,0.55)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M 8 0 Q 10 30 6 55 Q 4 80 9 100"
        fill="none"
        stroke="rgba(226,232,240,0.45)"
        strokeWidth="0.4"
        strokeDasharray="1.5 2.5"
        strokeLinecap="round"
      />
      {/* I-5 shield-style label — pill background with bold mark. */}
      <g transform="translate(11, 70)">
        <rect x="-3" y="-2.4" width="6" height="4.8" rx="1" fill="rgba(15,23,42,0.85)" stroke="rgba(148,163,184,0.7)" strokeWidth="0.25" />
        <text x="0" y="1" textAnchor="middle" fontSize="2.4" fontWeight="800" fill="rgba(226,232,240,0.95)" letterSpacing="0.2">
          I-5
        </text>
      </g>

      {/* Rainier Ave S — labeled subtle spine through the middle, where
          the shop sits. Slightly thicker than before so the "this is the
          street" reading is clearer; still subtle (purple-tinted, low
          opacity) so the neighborhood pins remain the focal point. */}
      <path
        d="M 30 8 Q 38 25 45 45 Q 50 60 55 80 L 60 95"
        fill="none"
        stroke="rgba(196,181,253,0.55)"
        strokeWidth="0.85"
        strokeLinecap="round"
      />
      <text
        x="32"
        y="13"
        fontSize="2"
        fontWeight="600"
        fill="rgba(216,180,254,0.85)"
        letterSpacing="0.4"
      >
        Rainier Ave S
      </text>

      {/* Link Light Rail — dotted indigo line tracing Mt Baker → Columbia
          City → Othello → Rainier Beach with three highlighted station
          dots. Indigo (not amber) per Doug's ask — keeps the brand
          identity intact and reads as the Link rather than another
          highway accent. */}
      <path
        d="M 53 22 Q 51 30 51 35 Q 50 42 50 50 Q 53 65 55 80"
        fill="none"
        stroke="#a5b4fc"
        strokeWidth="0.7"
        strokeDasharray="0.6 1.4"
        strokeLinecap="round"
        opacity="0.9"
      />
      {/* Station dots — three named stops on the South-Seattle Link
          alignment (Mt Baker / Columbia City / Othello). Tooltip-style
          label sits just east of each dot so it doesn't crowd the
          neighborhood pin labels. */}
      {LINK_STATIONS.map((s) => (
        <g key={s.id}>
          <circle cx={s.x} cy={s.y} r="0.9" fill="#312e81" stroke="#a5b4fc" strokeWidth="0.4" />
          <circle cx={s.x} cy={s.y} r="0.4" fill="#e0e7ff" />
          <text
            x={s.x + 1.6}
            y={s.y + 0.6}
            fontSize="1.55"
            fontWeight="700"
            fill="rgba(199,210,254,0.85)"
            stroke="#1e1b4b"
            strokeWidth="0.4"
            paintOrder="stroke"
            letterSpacing="0.2"
          >
            {s.name}
          </text>
        </g>
      ))}

      {/* Neighborhood pins. Stagger-fade-in on mount via inline animation
          delay; `reduceMotion` opt-out short-circuits the delay so users
          with prefers-reduced-motion see them all at once. Index drives
          the delay (50ms steps) so the array order = the visual entrance
          order, which roughly traces N→S down Rainier. */}
      {NEIGHBORHOODS.map((n, i) => (
        <PinSvg
          key={n.id}
          neighborhood={n}
          isActive={active === n.id}
          onActivate={onActivate}
          hasDeal={dealForNeighborhood(n.id) !== null}
          enterDelayMs={reduceMotion ? 0 : i * 50}
        />
      ))}

      {/* Shop pin — bigger, fuchsia, slow CSS pulse on the outer ring. */}
      <ShopPinSvg reduceMotion={reduceMotion} />
    </svg>
  );
}

function PinSvg({
  neighborhood,
  isActive,
  onActivate,
  hasDeal,
  enterDelayMs,
}: {
  neighborhood: Neighborhood;
  isActive: boolean;
  onActivate: (id: string) => void;
  hasDeal: boolean;
  enterDelayMs: number;
}) {
  const { x, y } = neighborhood.pos;
  // Stagger-fade-in on mount via inline-style animation. The
  // `pin-enter` keyframes live on the parent .neighborhood-map-svg
  // selector so we don't re-declare them per pin.
  const enterStyle =
    enterDelayMs > 0
      ? {
          animation: `pin-enter 420ms ease-out both`,
          animationDelay: `${enterDelayMs}ms`,
          outline: "none" as const,
        }
      : { outline: "none" as const };
  return (
    <g
      data-neighborhood-pin
      data-neighborhood={neighborhood.id}
      role="button"
      tabIndex={0}
      aria-label={`${neighborhood.name}, ${neighborhood.driveMin} minute drive${hasDeal ? ", deal of the day available" : ""} — activate for details`}
      aria-pressed={isActive}
      onClick={() => onActivate(neighborhood.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate(neighborhood.id);
        }
      }}
      className="cursor-pointer focus:outline-none group"
      style={enterStyle}
    >
      {/* Hit target — invisible but bigger than the visible pin so taps work
          on touch devices without forcing a tiny precise tap. */}
      <circle cx={x} cy={y} r="5" fill="transparent" />
      {/* Halo when active or hovered. */}
      <circle
        cx={x}
        cy={y}
        r="3.2"
        fill="#a5b4fc"
        opacity={isActive ? 0.45 : 0}
        className="transition-opacity duration-200 group-hover:opacity-30 group-focus-visible:opacity-45"
      />
      {/* The pin itself. */}
      <circle
        cx={x}
        cy={y}
        r={isActive ? 1.6 : 1.2}
        fill={isActive ? "#fff" : "#a5b4fc"}
        stroke={isActive ? "#a5b4fc" : "#312e81"}
        strokeWidth="0.4"
        className="transition-all duration-200 group-hover:r-1.6"
      />
      {/* Deal-of-the-day badge — solid amber dot at the upper-right of the
          pin so the eye spots which neighborhoods have a deal before
          tapping. Keyboard a11y is preserved — the parent <g> still
          announces "deal of the day available" via aria-label, and the
          badge itself is decorative (aria-hidden). */}
      {hasDeal && (
        <g aria-hidden="true">
          <circle cx={x + 1.3} cy={y - 1.3} r="0.9" fill="#f59e0b" stroke="#1e1b4b" strokeWidth="0.3" />
          {/* Tiny inner glow so the badge reads as "live" not just decorative. */}
          <circle cx={x + 1.3} cy={y - 1.3} r="0.4" fill="#fef3c7" />
        </g>
      )}
      {/* Label — sits above the pin. Drop-shadow stroke for legibility on
          gradient background. Slightly bigger + tighter letter-spacing
          than v1 so the typography feels more deliberate. */}
      <text
        x={x}
        y={y - 2.8}
        textAnchor="middle"
        fontSize="2.3"
        fontWeight="800"
        fill={isActive ? "#fff" : "#e0e7ff"}
        stroke="#1e1b4b"
        strokeWidth="0.55"
        paintOrder="stroke"
        letterSpacing="-0.05"
        className="select-none transition-colors duration-200 group-hover:fill-white"
      >
        {neighborhood.name}
      </text>
    </g>
  );
}

function ShopPinSvg({ reduceMotion }: { reduceMotion: boolean }) {
  // CSS pulse on the outer ring — slow, subtle, single-ring. Replaces the
  // previous SVG <animate> stack so motion is consistent with the rest of
  // the site (uses the global animate-glow / globals.css opt-out for
  // prefers-reduced-motion). We pick one ring (the outer halo) instead of
  // pulsing both halo + pin to keep the effect understated.
  return (
    <g aria-hidden="true">
      <circle
        cx={SHOP_PIN.x}
        cy={SHOP_PIN.y}
        r="3.4"
        fill="#e879f9"
        opacity={reduceMotion ? 0.35 : undefined}
        className={reduceMotion ? "" : "shop-pin-pulse"}
      />
      <circle cx={SHOP_PIN.x} cy={SHOP_PIN.y} r="2" fill="#f0abfc" />
      <circle cx={SHOP_PIN.x} cy={SHOP_PIN.y} r="1.1" fill="#fff" />
      <text
        x={SHOP_PIN.x}
        y={SHOP_PIN.y - 4}
        textAnchor="middle"
        fontSize="2.6"
        fontWeight="800"
        fill="#fff"
        stroke="#581c87"
        strokeWidth="0.6"
        paintOrder="stroke"
        letterSpacing="-0.05"
        className="select-none"
      >
        Seattle Cannabis Co.
      </text>
      <text
        x={SHOP_PIN.x}
        y={SHOP_PIN.y + 5.5}
        textAnchor="middle"
        fontSize="1.8"
        fontWeight="600"
        fill="#fbcfe8"
        stroke="#581c87"
        strokeWidth="0.4"
        paintOrder="stroke"
        className="select-none"
      >
        7266 Rainier Ave S
      </text>
    </g>
  );
}

function PopoverContent({
  neighborhood,
  deal,
  fallbackDealShort,
  destinationAddress,
  onClose,
}: {
  neighborhood: Neighborhood;
  deal: NeighborhoodDeal | null;
  fallbackDealShort: string | null;
  destinationAddress: string;
  onClose: () => void;
}) {
  const dealLabel = deal?.short ?? fallbackDealShort;
  return (
    <div className="space-y-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-indigo-700">
            From here
          </p>
          <h3
            id={`popover-${neighborhood.id}-name`}
            className="text-2xl font-extrabold text-stone-900 tracking-tight leading-tight mt-0.5"
          >
            {neighborhood.name}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 -mt-1 -mr-1 w-8 h-8 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 flex items-center justify-center transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>
      </div>

      <p className="text-[15px] text-stone-600 leading-snug">{neighborhood.blurb}</p>

      <div className="grid grid-cols-2 gap-2.5 pt-0.5">
        <div className="rounded-xl bg-indigo-50 border border-indigo-200 px-3.5 py-2.5">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-indigo-700">
            Drive
          </div>
          <div className="text-base font-extrabold text-indigo-900 leading-tight mt-0.5">
            {neighborhood.driveMin} min
          </div>
        </div>
        {neighborhood.walkMin ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-700">
              Walk
            </div>
            <div className="text-base font-extrabold text-emerald-900 leading-tight mt-0.5">
              {neighborhood.walkMin} min
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-700">
              Transit
            </div>
            <div className="text-base font-extrabold text-amber-900 leading-tight mt-0.5">
              Link Light Rail
            </div>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 text-[13px] text-stone-600 leading-snug">
        <TransitIcon />
        <span>{neighborhood.transit}</span>
      </div>

      {dealLabel && (
        <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/60 border border-amber-300 px-3.5 py-3">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-base">🔥</span>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-800">
              {deal ? "Today" : "Today's deal"}
            </span>
          </div>
          <p className="text-[15px] font-extrabold text-stone-900 mt-1 leading-snug">{dealLabel}</p>
          {deal?.detail && (
            <p className="text-[13px] text-stone-700 mt-1 leading-snug">{deal.detail}</p>
          )}
        </div>
      )}

      <a
        href={directionsUrl(neighborhood, destinationAddress)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-sm font-extrabold tracking-tight transition-colors shadow-md shadow-indigo-700/20"
      >
        Get directions from {neighborhood.name} <span aria-hidden>↗</span>
      </a>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm text-[10px] font-semibold text-white/80">
      <span className={`w-2 h-2 rounded-full ${swatch}`} />
      {label}
    </span>
  );
}

function TransitIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 mt-0.5 shrink-0 text-indigo-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect x="6" y="3" width="12" height="14" rx="2" />
      <path strokeLinecap="round" d="M9 21l1-3m4 3l-1-3M9 8h6" />
      <circle cx="9" cy="13" r="0.6" fill="currentColor" />
      <circle cx="15" cy="13" r="0.6" fill="currentColor" />
    </svg>
  );
}
