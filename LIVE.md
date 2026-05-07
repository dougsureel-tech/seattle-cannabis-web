# LIVE — seattle-cannabis-web (Seattle public site + /rewards PWA) deployment state

Last-Known-Good (LKG) deployment log per OPERATING_PRINCIPLES post-deploy verify rule.

**Canonical URL:** https://seattlecannabis.co
**Apex + www:** middleware-redirected to canonical (per `proxy.ts`)
**PWA at:** https://seattlecannabis.co/rewards (Track B SpringBig cutover replacement)
**Health endpoint:** /api/health
**Deploy trigger:** push to `main` (Vercel native via GitHub integration).

**Verification recipe:**

```bash
curl -fsS https://seattlecannabis.co/api/health \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('v%s sha=%s ok=%s' % (d['version'], d['sha'], d['ok']))"
```

Verified deploy = (a) HTTP 200, (b) `ok: true`, (c) `sha` matches what was just pushed.

**Why a separate /api/health on seattle-cannabis-web** (vs reading inventoryapp's): this repo is the **customer-facing** Seattle public site (apex `seattlecannabis.co`). inventoryapp serves Seattle staff at `seattle-cannabis-co.vercel.app` — different deployment + different DB. Both must be checked independently after a push that touches either.

---

## LKG history

| Date (PT) | Version | SHA | Notes |
|---|---|---|---|
| 2026-05-07 | v4.835 | 7dd85c5 | /rewards/page.tsx stale-comment-drift cleanup (wrong cookie + wrong routes — corrected to local `scc_rewards_session` + `/api/rewards/*`) |
| 2026-05-07 | v4.825 | 751ba79 | /rewards/* polish round 1 — 3× 🌱 a11y wraps + drop stale "Add to home screen" coming-soon bullet + hoist orphan import-type in /redeem |
| 2026-05-07 | v4.815 | c71ac2e | PWA manifest /rewards shortcut (long-press exposes Rewards alongside Order/Menu/Account) + AGENTS.md path-ref to `Green Life/AGENT_BOARD.md` |
| 2026-05-07 | v4.795 | 7f08aeb | /rewards LookupForm + balance page comments — drop stale Track B Week 1 TODOs (OTP shipped) |
| 2026-05-07 | v4.785 | 7e533ef | /rewards page comment block updated — reflects shipped OTP flow (was stale) |
| 2026-05-07 | (unversioned) | 6ebae8f | GET /api/rewards/me — client-side rewards snapshot |
| 2026-05-07 | (unversioned) | d6010b0 | /rewards Add-to-Home-Screen banner |
| 2026-05-07 | (unversioned) | 29dac64 | /rewards/history — visit + earnings history page |
| 2026-05-07 | (unversioned) | 029d48f | /rewards/redeem — redemption catalog page |
| 2026-05-07 | (unversioned) | 5535997 | /rewards OTP UI flow — login, verify, authed dashboard |
| 2026-05-07 | (unversioned) | e62d901 | /rewards OTP backend — request-code, verify-code, session helper |
| 2026-05-07 | (unversioned) | 94c3c71 | /rewards V0 — phone-lookup landing for the SpringBig cutover |
| 2026-05-06 | v4.775 | 8db1105 | /deals topicals icon 🌱 → 🧴 (mirror of greenlife-web v4.245) |

(Older entries elide; full history is in git log.)

---

## 🔴 Cutover-window context (2026-05-07 → 2026-06-25) — **THIS REPO IS ON THE CRITICAL PATH**

Per `Green Life/PLAN_SPRINGBIG_CUTOVER_5_25.md` Track B: the Seattle SpringBig consumer app retires ~2026-06-25, with the `/rewards` PWA on this repo as the replacement. Track B Week 3 (Days 6-10, 2026-05-12 to 2026-05-16) is the build window.

**Current PWA state (as of v4.835):**
- ✅ Phone-OTP login + verify flow shipped
- ✅ Authenticated dashboard with points balance + tier + visit count + lifetime spend
- ✅ /rewards/redeem — redemption catalog
- ✅ /rewards/history — visit + earnings history
- ✅ Add-to-Home-Screen banner
- ✅ /api/rewards/me client-side snapshot endpoint

**Pending (per cutover plan §6 SMS sequence):**
- Day 12 (2026-05-18) — first-push SMS to all SpringBig-migrated Seattle customers
- Day 13 (2026-05-19) — A2HS-tip reminder SMS
- Day 17 (2026-05-23) — cutover-eve SMS broadcast
- Day 18 (2026-05-25) — Wenatchee SpringBig disabled (Seattle stays alive +30d)
- ~2026-06-25 — Seattle SpringBig consumer app retires

**Deploy discipline during cutover:** every push that touches `/rewards/*` or `/api/rewards/*` MUST verify via the curl recipe above + update this LKG row before moving on. A broken /rewards deploy during the cutover window means real customer-facing breakage — Seattle SpringBig is the gap-stop, but degraded UX on the new PWA undermines the migration messaging.

---

## Sister LIVE.md files

- `Inventory App/LIVE.md` — staff-side inventoryapp (Wenatchee + Seattle deploys via separate Vercel projects) — established 2026-05-07 v170.745
- `greenlife-web/LIVE.md` — Wenatchee public site (NOT on cutover critical path) — established 2026-05-07 v4.255
- `Green Wellness/LIVE.md` — separate project — established 2026-05-06

---

## Rollback recipe (if a deploy lands broken)

1. Vercel dashboard → seattle-cannabis-web project → Deployments tab → find the LAST GREEN deploy from this LKG history.
2. Three-dot menu → "Promote to Production".
3. Confirm via curl that prod sha matches the rolled-back version.
4. Update LKG row noting the rollback + reason.
5. **During cutover window** also update `Inventory App/AGENT_BOARD.md` Track B entry with the rollback timestamp + reason.

Seattle-cannabis-web Vercel project lives under Doug's `dougsureel-tech` account.

---

## /rewards-specific verification (post-cutover-pivotal)

After any /rewards push, verify the customer-facing flow end-to-end:

```bash
# Landing
curl -fsSI https://seattlecannabis.co/rewards | head -3

# OTP backend reachable (will 405 without POST body — that's expected)
curl -fsS -o /dev/null -w "%{http_code}\n" -X POST https://seattlecannabis.co/api/rewards/request-code

# Manifest reachable for PWA
curl -fsS https://seattlecannabis.co/manifest.webmanifest | head -5
```

Manual: open the URL on phone, sign in with phone, verify dashboard renders, tap Add-to-Home-Screen banner, confirm one of the redeem-tier buttons works (does NOT need to actually redeem; just confirm the QR generates).

---

## Cross-references

- OPERATING_PRINCIPLES (`~/Documents/CODE/RANDOM/OPERATING_PRINCIPLES.md`) — the post-deploy verify discipline
- AGENT_BOARD (`~/Documents/CODE/Green Life/AGENT_BOARD.md`) — active in-flight work
- Cutover plan (`~/Documents/CODE/Green Life/PLAN_SPRINGBIG_CUTOVER_5_25.md`) — Track B execution doc
- INCIDENTS (`~/Documents/CODE/INCIDENTS.md`) — closed post-mortems (grep first)
