export const STORE = {
  name: "Seattle Cannabis Co.",
  tagline: "Seattle's Premier Cannabis Dispensary",
  address: {
    street: "TODO — add address",
    city: "Seattle",
    state: "WA",
    zip: "98101",
    full: "TODO — add full address, Seattle, WA",
  },
  phone: "TODO — add phone",
  phoneTel: "+1TODO",
  email: "info@seattlecannabis.com",
  website: "https://www.seattlecannabis.com",
  geo: { lat: 47.6062, lng: -122.3321 },
  googleMapsUrl: "https://maps.google.com/?q=Seattle+Cannabis+Co+Seattle+WA",
  googleMapsEmbed: "",
  hours: [
    { day: "Monday",    open: "8:00 AM", close: "11:00 PM" },
    { day: "Tuesday",   open: "8:00 AM", close: "11:00 PM" },
    { day: "Wednesday", open: "8:00 AM", close: "11:00 PM" },
    { day: "Thursday",  open: "8:00 AM", close: "11:00 PM" },
    { day: "Friday",    open: "8:00 AM", close: "11:00 PM" },
    { day: "Saturday",  open: "8:00 AM", close: "11:00 PM" },
    { day: "Sunday",    open: "8:00 AM", close: "11:00 PM" },
  ],
  iheartjaneStoreId: 0, // TODO — add iHeartJane store ID if applicable
  social: {
    instagram: "",
    facebook: "",
  },
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
