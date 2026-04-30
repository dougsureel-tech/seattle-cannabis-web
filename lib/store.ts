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

export function isOpenNow(): boolean {
  const now = new Date();
  const day = now.toLocaleDateString("en-US", { weekday: "long" });
  const hours = STORE.hours.find((h) => h.day === day);
  if (!hours) return false;
  const toMin = (t: string) => {
    const [time, ampm] = t.split(" ");
    const [h, m] = time.split(":").map(Number);
    return (ampm === "PM" && h !== 12 ? h + 12 : ampm === "AM" && h === 12 ? 0 : h) * 60 + m;
  };
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= toMin(hours.open) && cur < toMin(hours.close);
}
