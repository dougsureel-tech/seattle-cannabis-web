import { isOpenNow, nextOpenLabel, STORE, minutesUntilClose, getOrderingStatus } from "@/lib/store";
import { getActiveDeals } from "@/lib/db";

// Within this window before close, swap the static hours line for a live
// "Closes in X min" countdown. When the visitor arrives late this is the
// actual decision they're making — "do I have time?" — and surfacing the
// remaining minutes is more useful than restating the schedule.
const CLOSING_SOON_WINDOW_MIN = 90;

export async function AnnouncementBar() {
  const open = isOpenNow();
  const status = nextOpenLabel();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: "America/Los_Angeles" });
  const todayHours = STORE.hours.find((h) => h.day === today);
  const minsLeft = minutesUntilClose();
  const orderingStatus = getOrderingStatus();
  const closingSoon = open && minsLeft !== null && minsLeft <= CLOSING_SOON_WINDOW_MIN;

  // Most-urgent deal — first row from getActiveDeals (sorted by end-date
  // NULLS LAST) ending today or tomorrow. Skipped when a more urgent
  // time-driven mode (closing-soon / last-call / closed) is owning the
  // bar — "do I have time" beats "should I redeem".
  const deals = open && !closingSoon && orderingStatus.state !== "after_last_call" ? await getActiveDeals().catch(() => []) : [];
  const urgentDeal = (() => {
    if (deals.length === 0) return null;
    // eslint-disable-next-line react-hooks/purity -- Server Component renders per-request; timestamp is intentional for "ends today/tomorrow" math.
    const todayMs = Date.now();
    for (const d of deals) {
      if (!d.endDate) continue;
      const endMs = new Date(`${d.endDate}T23:59:59`).getTime();
      const days = Math.ceil((endMs - todayMs) / 86400000);
      if (days <= 1) return { deal: d, endsToday: days <= 0 };
    }
    return null;
  })();

  // Three banner shapes, escalating urgency:
  //   normal       — indigo/violet gradient, "Open · 8 AM-11 PM"
  //   closing-soon — amber gradient, "Closes in 22 min · order ahead for fast pickup"
  //   last-call    — rose gradient, "Online ordering done · still open in-store"
  let bg: string;
  let dot: string;
  let textColor: string;
  if (!open) {
    bg = "bg-gradient-to-r from-stone-800 via-stone-700 to-stone-800";
    dot = "bg-stone-500";
    textColor = "text-stone-300";
  } else if (orderingStatus.state === "after_last_call") {
    bg = "bg-gradient-to-r from-rose-900 via-rose-800 to-rose-900";
    dot = "bg-rose-300 shadow-[0_0_4px_#fda4af]";
    textColor = "text-rose-100";
  } else if (closingSoon) {
    bg = "bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800";
    dot = "bg-amber-300 shadow-[0_0_4px_#fcd34d] animate-pulse";
    textColor = "text-amber-100";
  } else {
    bg = "bg-gradient-to-r from-indigo-900 via-violet-900 to-indigo-900";
    dot = "bg-green-400 shadow-[0_0_4px_#4ade80]";
    textColor = "text-indigo-100";
  }

  let statusLine: React.ReactNode;
  if (!open) {
    statusLine = `Closed · ${status}`;
  } else if (orderingStatus.state === "after_last_call") {
    statusLine = `Online ordering done for today · in-store til ${orderingStatus.closesToday}`;
  } else if (closingSoon && minsLeft !== null) {
    statusLine = (
      <>
        <strong className="font-bold">Closes in {minsLeft} min</strong>
        <span className="opacity-80">· order ahead for fast pickup</span>
      </>
    );
  } else if (urgentDeal) {
    statusLine = (
      <>
        Open Now <span className="opacity-80">·</span>{" "}
        <span aria-hidden="true">🎟️</span>{" "}
        <strong className="font-bold">{urgentDeal.deal.short}</strong>{" "}
        <span className="opacity-80">{urgentDeal.endsToday ? "ends today" : "ends tomorrow"}</span>
      </>
    );
  } else {
    statusLine = `Open Now${todayHours ? ` · ${todayHours.open}–${todayHours.close}` : ""}`;
  }

  return (
    <div
      className={`text-xs font-medium py-1.5 px-4 text-center flex items-center justify-center gap-3 flex-wrap ${bg} ${textColor}`}
    >
      <span className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
        {statusLine}
      </span>
      <span className="hidden sm:block opacity-40">|</span>
      <a
        href={STORE.shopUrl}
        className="opacity-75 hover:opacity-100 transition-opacity hidden sm:block font-semibold"
      >
        Order Online — Save 15% ↗
      </a>
      <span className="hidden sm:block opacity-40">|</span>
      <span className="opacity-75">Cash only · 21+ · ATM on site</span>
    </div>
  );
}
