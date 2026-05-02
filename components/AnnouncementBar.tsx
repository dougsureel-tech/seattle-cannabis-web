import { isOpenNow, nextOpenLabel, STORE } from "@/lib/store";

export function AnnouncementBar() {
  const open = isOpenNow();
  const status = nextOpenLabel();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: "America/Los_Angeles" });
  const todayHours = STORE.hours.find((h) => h.day === today);

  return (
    <div
      // Open: deep-indigo → violet gradient gives the bar real depth instead of
      // a flat slab. Closed: warm-stone gradient (still distinct from open
      // state, but quieter — matches the "we're not serving you right now" vibe).
      className={`text-xs font-medium py-1.5 px-4 text-center flex items-center justify-center gap-3 flex-wrap ${
        open
          ? "bg-gradient-to-r from-indigo-900 via-violet-900 to-indigo-900 text-indigo-100"
          : "bg-gradient-to-r from-stone-800 via-stone-700 to-stone-800 text-stone-300"
      }`}
    >
      <span className="flex items-center gap-1.5">
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${open ? "bg-green-400 shadow-[0_0_4px_#4ade80]" : "bg-stone-500"}`}
        />
        {open
          ? `Open Now${todayHours ? ` · ${todayHours.open}–${todayHours.close}` : ""}`
          : `Closed · ${status}`}
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
