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

import { useEffect, useRef, useState } from "react";
import { NEIGHBORHOODS, SHOP_PIN, directionsUrl, type Neighborhood } from "@/lib/neighborhoods";
import { dealForNeighborhood, type NeighborhoodDeal } from "@/lib/neighborhood-deals";

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
              <MapSvg active={active} onActivate={activate} />

              {/* Map legend — bottom-left chip cluster. */}
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 max-w-[80%]">
                <Legend swatch="bg-fuchsia-400" label="Our shop" />
                <Legend swatch="bg-indigo-300" label="Neighborhood" />
                <Legend swatch="bg-amber-300" label="Light Rail" />
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

          {/* Sidebar — 4/12 on desktop. Lists every neighborhood as a clickable
              row; the SVG is just an alternate way to reach the same data. */}
          <ul className="sm:col-span-4 space-y-2" aria-label="Neighborhoods we serve">
            {NEIGHBORHOODS.map((n) => {
              const isActive = active === n.id;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    data-neighborhood={n.id}
                    onClick={() => activate(n.id)}
                    className={`w-full text-left rounded-2xl border px-4 py-3 transition-all ${
                      isActive
                        ? "border-indigo-500 bg-indigo-50 shadow-md"
                        : "border-stone-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-bold text-sm ${isActive ? "text-indigo-900" : "text-stone-900"}`}
                      >
                        {n.name}
                      </span>
                      <span className="text-xs font-semibold text-indigo-700 whitespace-nowrap">
                        {n.driveMin} min
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 leading-snug mt-1">{n.transit}</p>
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
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1">
                    <span aria-hidden="true">🎟️</span>
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
}: {
  active: string | null;
  onActivate: (id: string) => void;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="South Seattle neighborhood map showing Seattle Cannabis Co. and surrounding neighborhoods"
      className="w-full h-auto aspect-[4/3]"
    >
      {/* Subtle grid behind everything for "map" feel. */}
      <defs>
        <pattern
          id="map-grid"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
        >
          <path d="M6 0 L0 0 L0 6" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
        </pattern>
        <radialGradient id="lake-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" fill="url(#map-grid)" />

      {/* Lake Washington — east side. Big soft glow + label. */}
      <path
        d="M 88 5 Q 100 25 95 60 Q 100 85 80 100 L 100 100 L 100 0 Z"
        fill="url(#lake-grad)"
      />
      <text
        x="92"
        y="48"
        textAnchor="middle"
        fontSize="2.2"
        fill="rgba(165,180,252,0.6)"
        fontStyle="italic"
        letterSpacing="0.3"
      >
        Lake Washington
      </text>

      {/* I-5 — west edge, dashed. */}
      <line
        x1="6"
        y1="0"
        x2="6"
        y2="100"
        stroke="rgba(165,180,252,0.35)"
        strokeWidth="0.5"
        strokeDasharray="1.5 1.5"
      />
      <text
        x="3.2"
        y="50"
        fontSize="1.8"
        fill="rgba(165,180,252,0.55)"
        transform="rotate(-90 3.2 50)"
        letterSpacing="0.4"
      >
        I-5
      </text>

      {/* Rainier Ave S — the spine. Solid indigo line through the middle. */}
      <path
        d="M 30 8 Q 38 25 45 45 Q 50 60 55 80 L 60 95"
        fill="none"
        stroke="rgba(196,181,253,0.45)"
        strokeWidth="0.7"
        strokeLinecap="round"
      />
      <text
        x="32"
        y="14"
        fontSize="1.9"
        fill="rgba(196,181,253,0.7)"
        letterSpacing="0.3"
      >
        Rainier Ave S
      </text>

      {/* Light Rail — dotted amber line tracing Mt Baker → Othello → Rainier Beach. */}
      <path
        d="M 55 22 Q 53 35 50 50 Q 53 65 55 80"
        fill="none"
        stroke="#fcd34d"
        strokeWidth="0.6"
        strokeDasharray="0.8 1.2"
        opacity="0.85"
      />

      {/* Neighborhood pins. */}
      {NEIGHBORHOODS.map((n) => (
        <PinSvg
          key={n.id}
          neighborhood={n}
          isActive={active === n.id}
          onActivate={onActivate}
        />
      ))}

      {/* Shop pin — bigger, fuchsia, pulses in CSS. */}
      <ShopPinSvg />
    </svg>
  );
}

function PinSvg({
  neighborhood,
  isActive,
  onActivate,
}: {
  neighborhood: Neighborhood;
  isActive: boolean;
  onActivate: (id: string) => void;
}) {
  const { x, y } = neighborhood.pos;
  return (
    <g
      data-neighborhood-pin
      data-neighborhood={neighborhood.id}
      role="button"
      tabIndex={0}
      aria-label={`${neighborhood.name}, ${neighborhood.driveMin} minute drive — activate for details`}
      aria-pressed={isActive}
      onClick={() => onActivate(neighborhood.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate(neighborhood.id);
        }
      }}
      className="cursor-pointer focus:outline-none group"
      style={{ outline: "none" }}
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
      {/* Label — sits above the pin. Drop-shadow stroke for legibility on
          gradient background. */}
      <text
        x={x}
        y={y - 2.8}
        textAnchor="middle"
        fontSize="2.1"
        fontWeight="700"
        fill={isActive ? "#fff" : "#e0e7ff"}
        stroke="#1e1b4b"
        strokeWidth="0.5"
        paintOrder="stroke"
        className="select-none transition-colors duration-200 group-hover:fill-white"
      >
        {neighborhood.name}
      </text>
    </g>
  );
}

function ShopPinSvg() {
  return (
    <g aria-hidden="true">
      {/* Pulsing halo — pure SVG <animate> so we don't need extra CSS. */}
      <circle cx={SHOP_PIN.x} cy={SHOP_PIN.y} r="3" fill="#e879f9" opacity="0.35">
        <animate
          attributeName="r"
          values="3;5;3"
          dur="3s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.45;0.1;0.45"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx={SHOP_PIN.x} cy={SHOP_PIN.y} r="2" fill="#f0abfc" />
      <circle cx={SHOP_PIN.x} cy={SHOP_PIN.y} r="1.1" fill="#fff" />
      <text
        x={SHOP_PIN.x}
        y={SHOP_PIN.y - 4}
        textAnchor="middle"
        fontSize="2.4"
        fontWeight="800"
        fill="#fff"
        stroke="#581c87"
        strokeWidth="0.6"
        paintOrder="stroke"
        className="select-none"
      >
        Seattle Cannabis Co.
      </text>
      <text
        x={SHOP_PIN.x}
        y={SHOP_PIN.y + 5.5}
        textAnchor="middle"
        fontSize="1.7"
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
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">
            From here
          </p>
          <h3
            id={`popover-${neighborhood.id}-name`}
            className="text-xl font-extrabold text-stone-900 tracking-tight"
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

      <p className="text-sm text-stone-600 leading-snug">{neighborhood.blurb}</p>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-3 py-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">
            Drive
          </div>
          <div className="text-sm font-extrabold text-indigo-900">{neighborhood.driveMin} min</div>
        </div>
        {neighborhood.walkMin ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
              Walk
            </div>
            <div className="text-sm font-extrabold text-emerald-900">{neighborhood.walkMin} min</div>
          </div>
        ) : (
          <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
              Transit
            </div>
            <div className="text-sm font-extrabold text-amber-900">Link Light Rail</div>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 text-xs text-stone-600 leading-snug">
        <TransitIcon />
        <span>{neighborhood.transit}</span>
      </div>

      {dealLabel && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span aria-hidden="true">🎟️</span>
            <span className="text-xs font-bold uppercase tracking-wide text-amber-800">
              {deal ? "Today" : "Today's deal"}
            </span>
          </div>
          <p className="text-sm font-bold text-stone-900 mt-0.5">{dealLabel}</p>
          {deal?.detail && (
            <p className="text-xs text-stone-600 mt-0.5 leading-snug">{deal.detail}</p>
          )}
        </div>
      )}

      <a
        href={directionsUrl(neighborhood, destinationAddress)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-sm font-bold transition-colors"
      >
        Get directions from {neighborhood.name} ↗
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
