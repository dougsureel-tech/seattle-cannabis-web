// Team roster for the "Our Community" page + the /order closing CTA's
// named-crew chips. Mirrors the shape of greenlife-web's lib/team.ts so
// the same consumers work in either repo. Add new people as a row, change
// `era` from current → alumni when they move on (don't delete — the point
// of including alumni is acknowledging that the place is built by everyone
// who's worked here).
//
// `photoSrc` should resolve to a file in `public/team/`. Until a photo is
// uploaded, the component renders an initials avatar — the row still
// shows up, just without a portrait. (Seattle has no team photos yet —
// every row is null until Doug ships them.)
//
// Source for the current roster: memory `project_seattle_roster` (May
// 2026). Roles use natural-language titles for the customer-facing copy;
// the inventory app's role enum (lead / inventory_manager / budtender)
// lives in src/lib/roles.ts on that side and is unrelated to what we
// show on the public site here.

export type TeamMember = {
  name: string;
  role: string;
  era: "current" | "alumni";
  photoSrc: string | null;
  // One-line "what they're into / known for". Keeps the page warm without
  // turning into a corporate bio dump. Empty string = no line yet (we'll
  // fill in as Doug + Kat collect them on the floor).
  oneLine: string;
};

export const TEAM: TeamMember[] = [
  // ── Current — Seattle Cannabis Co. (Green Anne LLC) roster, May 2026 ──
  // Doug removed from public-facing team page on Doug's call 2026-05-07
  // ("take us off the website for now"). Kat as GM is the current
  // top-of-org public face. Doug still owns the place; just not
  // surfaced on /our-community.
  {
    name: "Kat",
    role: "General Manager",
    era: "current",
    photoSrc: null,
    oneLine: "Runs both stores. Knows every regular by name and every vendor by handshake.",
  },

  // ── Floor leads ─────────────────────────────────────────────────────
  {
    name: "Jensine San",
    role: "Floor Lead",
    era: "current",
    photoSrc: null,
    oneLine: "",
  },
  {
    name: "Abram Freitas",
    role: "Floor Lead",
    era: "current",
    photoSrc: null,
    oneLine: "",
  },

  // ── Admin ───────────────────────────────────────────────────────────
  {
    name: "Austin Aronson",
    role: "Admin",
    era: "current",
    photoSrc: null,
    oneLine: "",
  },

  // ── Budtenders ──────────────────────────────────────────────────────
  {
    name: "Kaelin Johnson",
    role: "Budtender",
    era: "current",
    photoSrc: null,
    oneLine: "",
  },
  {
    name: "Mari Taylor",
    role: "Budtender",
    era: "current",
    photoSrc: null,
    oneLine: "",
  },
  {
    name: "Kathryn Haney",
    role: "Budtender",
    era: "current",
    photoSrc: null,
    oneLine: "",
  },
  {
    name: "Jamahl Dingle",
    role: "Budtender",
    era: "current",
    photoSrc: null,
    oneLine: "",
  },
  {
    name: "Jordan Calvert",
    role: "Budtender",
    era: "current",
    photoSrc: null,
    oneLine: "",
  },
  {
    name: "Anthony Farin",
    role: "Budtender",
    era: "current",
    photoSrc: null,
    oneLine: "",
  },
  {
    name: "Morgan Valenzona",
    role: "Budtender",
    era: "current",
    photoSrc: null,
    oneLine: "",
  },
  {
    name: "Christopher Boquez",
    role: "Budtender",
    era: "current",
    photoSrc: null,
    oneLine: "",
  },

  // ── Alumni — the shop is also built by people who've moved on ──────
  // (No alumni seeded yet — Doug will provide names + bios as he gathers
  // them. Seattle has been open since 2010 so there's a real list to
  // surface; left intentionally empty rather than guessed.)
];

export const CURRENT_TEAM = TEAM.filter((m) => m.era === "current");
export const ALUMNI_TEAM = TEAM.filter((m) => m.era === "alumni");

// Avatar initial fallback for missing photos.
export function initialOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}
