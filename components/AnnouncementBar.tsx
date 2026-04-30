import { isOpenNow } from "@/lib/store";
import { STORE } from "@/lib/store";

export function AnnouncementBar() {
  const open = isOpenNow();

  return (
    <div className={`text-xs font-medium py-1.5 px-4 text-center flex items-center justify-center gap-3 flex-wrap ${open ? "bg-indigo-900 text-indigo-100" : "bg-stone-800 text-stone-300"}`}>
      <span className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${open ? "bg-green-400 shadow-[0_0_4px_#4ade80]" : "bg-stone-500"}`} />
        {open ? "Open Now · 8AM–11PM Daily" : "Currently Closed · Opens 8AM"}
      </span>
      <span className="hidden sm:block opacity-40">|</span>
      <a href={STORE.shopUrl} target="_blank" rel="noopener noreferrer"
        className="opacity-75 hover:opacity-100 transition-opacity hidden sm:block font-semibold">
        Order Online — Save 15% ↗
      </a>
      <span className="hidden sm:block opacity-40">|</span>
      <span className="opacity-75">Cash only · 21+ · Veteran-owned</span>
    </div>
  );
}
