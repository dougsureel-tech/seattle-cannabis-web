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
  website: "https://www.seattlecannabis.com",
  geo: { lat: 47.5345, lng: -122.2773 },
  googleMapsUrl: "https://maps.google.com/?q=7266+Rainier+Ave+S+Seattle+WA+98118",
  googleMapsEmbed: "",
  neighborhood: "Rainier Valley",
  nearbyNeighborhoods: ["Seward Park", "Rainier Beach", "Beacon Hill", "Mount Baker", "Columbia City"],
  hours: [
    { day: "Monday",    open: "8:00 AM", close: "11:00 PM" },
    { day: "Tuesday",   open: "8:00 AM", close: "11:00 PM" },
    { day: "Wednesday", open: "8:00 AM", close: "11:00 PM" },
    { day: "Thursday",  open: "8:00 AM", close: "11:00 PM" },
    { day: "Friday",    open: "8:00 AM", close: "11:00 PM" },
    { day: "Saturday",  open: "8:00 AM", close: "11:00 PM" },
    { day: "Sunday",    open: "8:00 AM", close: "11:00 PM" },
  ],
  iheartjaneStoreId: 0, // uses shop.seattlecannabis.co — confirm platform before wiring
  shopUrl: "https://shop.seattlecannabis.co/south-seattle",
  wslcbLicense: "426199",
  social: {
    instagram: "https://www.instagram.com/scc_rainier/",
    facebook: "https://www.facebook.com/seattleccrainier/",
  },
  amenities: ["Free parking", "ATM on-site", "ADA accessible", "Dogs welcome", "Walk-ins welcome", "Online ordering"],
  perks: ["Veteran-owned", "Military discounts", "Loyalty rewards", "15% off online orders"],
} as const;

const TZ = "America/Los_Angeles";

function toMin(t: string): number {
  const [time, ampm] = t.split(" ");
  const [h, m] = time.split(":").map(Number);
  return (ampm === "PM" && h !== 12 ? h + 12 : ampm === "AM" && h === 12 ? 0 : h) * 60 + m;
}

function nowMin(): number {
  const parts = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ });
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
