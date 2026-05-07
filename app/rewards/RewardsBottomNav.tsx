// SpringBig cutover Track B Day 9 — sticky bottom-nav for the /rewards
// PWA. Per /CODE/Green Life/PLAN_SPRINGBIG_CUTOVER_5_25.md §4 Day 9.
// Three tabs (Home / Redeem / History) — Profile deferred until /rewards/
// profile exists. 44px touch targets per Apple HIG. Server component;
// parent passes the active tab as a prop so we don't need usePathname.

import Link from "next/link";

export type RewardsTab = "dashboard" | "redeem" | "history";

const TABS: { id: RewardsTab; label: string; href: string; emoji: string }[] = [
  { id: "dashboard", label: "Home", href: "/rewards/dashboard", emoji: "🏠" },
  { id: "redeem", label: "Redeem", href: "/rewards/redeem", emoji: "🎟️" },
  { id: "history", label: "History", href: "/rewards/history", emoji: "📜" },
];

export function RewardsBottomNav({ active }: { active: RewardsTab }) {
  return (
    <>
      {/* Bottom-padding spacer so the page's last content row isn't
          hidden behind the fixed nav. Matches the nav's effective height
          (12px padding + ~36px content = ~60px). pb-20 at the page level
          gives breathing room above the fixed bar. */}
      <div className="h-20" aria-hidden="true" />
      <nav
        className="fixed bottom-0 inset-x-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur-md shadow-[0_-2px_8px_rgba(0,0,0,0.04)]"
        aria-label="Rewards navigation"
      >
        <div className="max-w-md mx-auto grid grid-cols-3">
          {TABS.map((t) => {
            const isActive = t.id === active;
            return (
              <Link
                key={t.id}
                href={t.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 min-h-[56px] py-2 transition-colors ${
                  isActive
                    ? "text-indigo-700"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                <span className="text-lg leading-none" aria-hidden="true">
                  {t.emoji}
                </span>
                <span className={`text-[11px] font-semibold tracking-wide ${isActive ? "text-indigo-700" : ""}`}>
                  {t.label}
                </span>
                {isActive && (
                  <span
                    className="absolute bottom-0 h-0.5 w-12 bg-indigo-700 rounded-full"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
