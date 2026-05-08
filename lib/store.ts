export const STORE = {
  name: "Seattle Cannabis Co.",
  tagline: "Rainier Valley's Cannabis Dispensary",
  address: {
    street: "7266 Rainier Ave S",
    city: "Seattle",
    state: "WA",
    zip: "98118",
    full: "7266 Rainier Ave S, Seattle, WA 98118",
  },
  phone: "(206) 420-1042",
  phoneTel: "+12064201042",
  email: "rainier@seattlecannabis.co",
  website: "https://seattlecannabis.co",
  geo: { lat: 47.5345, lng: -122.2773 },
  googleMapsUrl: "https://maps.google.com/?q=7266+Rainier+Ave+S+Seattle+WA+98118",
  googleMapsEmbed: "",
  neighborhood: "Rainier Valley",
  // Eight South-Seattle neighborhoods we're the closest shop to. Used by the
  // homepage hero pill cluster + the LocalBusiness JSON-LD `areaServed` graph
  // + the metadata description, so geo-targeted ads + organic SEO have a
  // consistent footprint. NeighborhoodMap.tsx mirrors this set.
  nearbyNeighborhoods: [
    "Seward Park",
    "Rainier Beach",
    "Beacon Hill",
    "Mount Baker",
    "Columbia City",
    "Othello",
    "Hillman City",
  ],
  hours: [
    { day: "Monday", open: "8:00 AM", close: "11:00 PM" },
    { day: "Tuesday", open: "8:00 AM", close: "11:00 PM" },
    { day: "Wednesday", open: "8:00 AM", close: "11:00 PM" },
    { day: "Thursday", open: "8:00 AM", close: "11:00 PM" },
    { day: "Friday", open: "8:00 AM", close: "11:00 PM" },
    { day: "Saturday", open: "8:00 AM", close: "11:00 PM" },
    { day: "Sunday", open: "8:00 AM", close: "11:00 PM" },
  ],
  iheartjaneStoreId: 5295,
  shopUrl: "/menu",
  wslcbLicense: "426199",
  social: {
    instagram: "https://www.instagram.com/scc_rainier/",
    facebook: "https://www.facebook.com/seattleccrainier/",
  },
  amenities: [
    "Free parking",
    "ATM on-site",
    "ADA accessible",
    "Dogs welcome",
    "Walk-ins welcome",
    "Online ordering",
  ],
  perks: ["Open since 2010", "Service discounts", "Loyalty rewards", "15% off online orders"],
} as const;

// Pacific Time SSoT — single source of truth for the store's timezone.
// Every customer-facing datetime renders against this constant. Eight
// other modules (deal-countdown, store-hours, multiple page.tsx files,
// AnnouncementBar, MobileStickyCta, account/orders, etc.) import this
// rather than re-declaring an inline `"America/Los_Angeles"` literal.
// Sister repo: greenlife-web exports STORE_TZ from its own lib/store.ts
// (v4.535). Don't re-inline; closes the same arc inventoryapp's
// `STORE_TZ` consolidation closed in v167.665.
export const STORE_TZ = "America/Los_Angeles";

const TZ = STORE_TZ;

function toMin(t: string): number {
  const [time, ampm] = t.split(" ");
  const [h, m] = time.split(":").map(Number);
  return (ampm === "PM" && h !== 12 ? h + 12 : ampm === "AM" && h === 12 ? 0 : h) * 60 + m;
}

function nowMin(): number {
  const parts = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TZ,
  });
  const [h, m] = parts.split(":").map(Number);
  return h * 60 + m;
}

function todayDay(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: TZ });
}

export function isOpenNow(): boolean {
  const hours = STORE.hours.find((h) => h.day === todayDay());
  if (!hours) return false;
  const cur = nowMin();
  return cur >= toMin(hours.open) && cur < toMin(hours.close);
}

// Today's close-time string. Sea is uniform 11 PM today so this returns
// the same value every day, but keeps customer copy day-aware so a
// future Sat/Sun adjustment (matching Wen's pattern) doesn't reintroduce
// the `STORE.hours[0]?.close` drift bug. Sister to greenlife-web v4.835.
export function todayCloseLabel(): string {
  return STORE.hours.find((h) => h.day === todayDay())?.close ?? "11:00 PM";
}

// "Closes at 11:00 PM" when open; "Opens at 8:00 AM" when before today's open;
// "Opens tomorrow at 8:00 AM" otherwise.
export function nextOpenLabel(): string {
  const day = todayDay();
  const today = STORE.hours.find((h) => h.day === day);
  const cur = nowMin();
  if (today && cur < toMin(today.open)) return `Opens at ${today.open}`;
  if (today && cur >= toMin(today.open) && cur < toMin(today.close)) return `Closes at ${today.close}`;
  const order = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const idx = order.indexOf(day);
  for (let i = 1; i <= 7; i++) {
    const next = STORE.hours.find((h) => h.day === order[(idx + i) % 7]);
    if (next) return `Opens ${i === 1 ? "tomorrow" : next.day} at ${next.open}`;
  }
  return "";
}

// Uniform daily hours (Seattle is 8 AM–11 PM seven days a week) → "8:00 AM–11:00 PM daily".
export function hoursSummary(): string {
  const ranges = STORE.hours.map((h) => `${h.open}–${h.close}`);
  const uniform = ranges.every((r) => r === ranges[0]);
  if (uniform) return `${ranges[0]} daily`;
  const counts = ranges.reduce<Record<string, number>>((acc, r) => ((acc[r] = (acc[r] ?? 0) + 1), acc), {});
  const [common] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return `${common} daily · later Fri & Sat`;
}

// ── Pickup ordering ───────────────────────────────────────────────────────
// WA cannabis retail is pickup-only. Last online order is 15 min before
// close so staff have time to pull and stage the order. Slots are 15 min
// granularity, starting 30 min from now (prep buffer) up to close-minus-15.

const PREP_BUFFER_MINUTES = 30;
const LAST_CALL_BEFORE_CLOSE = 15;
const SLOT_INTERVAL_MINUTES = 15;

export type OrderingStatus =
  | { state: "open"; closeMin: number; lastCallMin: number; minutesUntilLastCall: number }
  | { state: "before_open"; opensAt: string }
  | { state: "after_last_call"; reopensAt: string; closesToday: string }
  | { state: "closed_today"; opensAt: string };

export function getOrderingStatus(): OrderingStatus {
  const day = todayDay();
  const today = STORE.hours.find((h) => h.day === day);
  const cur = nowMin();

  if (!today) return nextDayOpening();

  const openMin = toMin(today.open);
  const closeMin = toMin(today.close);
  const lastCallMin = closeMin - LAST_CALL_BEFORE_CLOSE;

  if (cur < openMin) return { state: "before_open", opensAt: today.open };
  if (cur >= lastCallMin) {
    const next = nextDayOpening();
    return {
      state: "after_last_call",
      reopensAt: next.state === "before_open" || next.state === "closed_today" ? next.opensAt : "",
      closesToday: today.close,
    };
  }
  return { state: "open", closeMin, lastCallMin, minutesUntilLastCall: lastCallMin - cur };
}

// Convenience for the announcement bar / hero — minutes until the store
// closes today, or null when closed. Lets the UI flip from "8 AM-11 PM"
// to "Closes in 22 min" when a visitor lands late and the time-remaining
// is the actual decision they're making.
export function minutesUntilClose(): number | null {
  const today = STORE.hours.find((h) => h.day === todayDay());
  if (!today) return null;
  const cur = nowMin();
  const closeMin = toMin(today.close);
  if (cur < toMin(today.open) || cur >= closeMin) return null;
  return closeMin - cur;
}

function nextDayOpening(): OrderingStatus {
  const order = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const day = todayDay();
  const idx = order.indexOf(day);
  for (let i = 1; i <= 7; i++) {
    const next = STORE.hours.find((h) => h.day === order[(idx + i) % 7]);
    if (next) return { state: "closed_today", opensAt: next.open };
  }
  return { state: "closed_today", opensAt: "8:00 AM" };
}

export type PickupSlot = { value: string; label: string };

export function getPickupSlots(): PickupSlot[] {
  const status = getOrderingStatus();
  if (status.state !== "open") return [];

  const cur = nowMin();
  const earliest = Math.max(cur + PREP_BUFFER_MINUTES, cur);
  const firstSlot = Math.ceil(earliest / SLOT_INTERVAL_MINUTES) * SLOT_INTERVAL_MINUTES;

  const slots: PickupSlot[] = [];
  for (let t = firstSlot; t <= status.lastCallMin; t += SLOT_INTERVAL_MINUTES) {
    if (t >= 24 * 60) break;
    slots.push({ value: minToHHMM(t), label: minToLabel(t) });
  }
  return slots;
}

function minToHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function minToLabel(min: number): string {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function validatePickupTime(hhmm: string): string | null {
  if (!/^\d{2}:\d{2}$/.test(hhmm)) return "Pick a pickup time.";
  const [h, m] = hhmm.split(":").map(Number);
  if (h < 0 || h > 23 || m < 0 || m > 59) return "Invalid pickup time.";
  const min = h * 60 + m;
  const status = getOrderingStatus();
  if (status.state !== "open") return "Online ordering is closed right now.";
  const cur = nowMin();
  if (min < cur + PREP_BUFFER_MINUTES) {
    return `Earliest pickup is ${PREP_BUFFER_MINUTES} minutes from now — pick a later time.`;
  }
  if (min > status.lastCallMin) {
    return `Last pickup is ${LAST_CALL_BEFORE_CLOSE} minutes before close — pick an earlier time.`;
  }
  return null;
}

export function pickupTimeToISO(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const now = new Date();
  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const yyyy = dateParts.find((p) => p.type === "year")!.value;
  const mm = dateParts.find((p) => p.type === "month")!.value;
  const dd = dateParts.find((p) => p.type === "day")!.value;
  const tzOffsetMin = getTzOffsetMin(now, TZ);
  const utcMin = h * 60 + m - tzOffsetMin;
  const utcH = Math.floor((((utcMin % (24 * 60)) + 24 * 60) % (24 * 60)) / 60);
  const utcM = ((utcMin % 60) + 60) % 60;
  const dayShift = Math.floor(utcMin / (24 * 60));
  const baseDate = new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
  baseDate.setUTCDate(baseDate.getUTCDate() + dayShift);
  baseDate.setUTCHours(utcH, utcM, 0, 0);
  return baseDate.toISOString();
}

function getTzOffsetMin(date: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(date).reduce<Record<string, string>>((acc, p) => {
    if (p.type !== "literal") acc[p.type] = p.value;
    return acc;
  }, {});
  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return Math.round((asUTC - date.getTime()) / 60000);
}
