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

## Deploy

Push to `main` triggers automatic Vercel deployment. Verify with:

```bash
curl https://www.seattlecannabis.co/api/health
```

Expected: `{"ok":true,"version":"X.Y","sha":"...","checks":{...}}`.

## License

Private. All rights reserved by Green Anne LLC (the WSLCB licensee operating Seattle Cannabis Co).
