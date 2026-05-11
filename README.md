# seattle-cannabis-web

Customer-facing public site for **Seattle Cannabis Co** (Rainier Valley, Seattle, WA — WSLCB #426199).

Sister repo: `greenlife-web` (same shape, Wenatchee store).

## Stack

- Next.js 16 App Router · TypeScript · Tailwind v4
- Postgres (Neon) via raw `postgres` driver in `lib/db.ts` — no ORM
- Clerk for customer auth (rewards portal)
- Resend for transactional email
- Twilio for OTP / customer SMS
- iHeartJane Boost embed at `/menu` (canonical product surface)

## Getting started

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Documentation

- **`AGENTS.md`** — architecture, conventions, cross-session coordination protocol
- **`/CODE/CLAUDE.md`** + **`/CODE/OPERATING_PRINCIPLES.md`** — Doug's working norms
- **`/CODE/INCIDENTS.md`** — closed post-mortems (grep first when diagnosing)

## Pre-push enforcement

Every `git push` runs `.githooks/pre-push` (31 gates total). The 8
doctrinal arc-guards enforce recurring brand-voice + WSLCB-compliance
+ defense-pattern classes:

| Guard | Doctrine |
|---|---|
| `check-brand-voice-locally-owned` | Doug 2026-05-02 ownership directive (NO "locally owned" framing — ownership change coming) |
| `check-efficacy-claims` | WAC 314-55-155 (no causation framing tying compounds → predictable effects) |
| `check-loyalty-math-drift` | Doug 2026-05-07 sliding ladder (50pt→5%, 100pt→10%, ... 30% at 300-400pt) |
| `check-please-hedge` | Brand-voice "What we never do" — drop "Please verb" from customer error/validation strings |
| `check-template-warmth` | Direct shop-voice — no "give us a call/ring", "drop us a line", "reach out to us" |
| `check-apologize-pattern` | Never apologize for things that aren't our fault (apology = concession of fault) |
| `check-store-name-double-period` | v22.005 — `${STORE.name}.` produces "Co.." double period in SERP descriptions (scc-only) |
| `check-no-unsafe-redirect` | v22.405 (sister inv v397.485) — preventive: `searchParams.get("returnTo")` → `router.push(target)` open-redirect class lock |

Each guard is a `scripts/check-*.mjs` Node script that scans `app/` +
`components/` + `lib/` and exits non-zero on a violation. Setup hook:
`git config core.hooksPath .githooks`.

## Deploy

Push to `main` triggers automatic Vercel deployment. Verify with:

```bash
curl https://www.seattlecannabis.co/api/health
```

Expected: `{"ok":true,"version":"X.Y","sha":"...","checks":{...}}`.

## License

Private. All rights reserved by Green Anne LLC (the WSLCB licensee operating Seattle Cannabis Co).
