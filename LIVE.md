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
| 2026-05-08 | v8.885 | eaaefd0 | 🛡️ PII-leak round 4 — `app/api/quiz/capture/route.ts` two catches (D+0 dispatch Resend + INSERT Drizzle) rewritten from `err.message` to `err.name`. Sister glw v7.745 same wave. Pre-fix: Resend errors echo recipient email + sender domain; Drizzle errors echo conflicting row data. Wrapper-source fix at v8.865 missed this route because it doesn't go through `lib/email.ts`. Verify-via-curl `v8.885 / sha=eaaefd0 / ok=true`. Pre-commit Explore review CLEAN. tsc clean. |
| 2026-05-08 | v8.415 | ae27243 | 🛡️ vercel.app-defense sister-fix — propagated to `lib/quiz-nurture-email.ts` PUBLIC_ORIGIN + `app/api/rewards/sign-out/route.ts` post-sign-out redirect. Sister of v8.375 welcome-email pattern; cross-repo bug-pattern hunt found 2 more SITE_URL/SITE_ORIGIN consumers in same drift class. Pre-fix: if env var ever drifts to *.vercel.app, customer unsubscribe link + post-sign-out redirect would land on non-canonical preview host. Verify-via-curl confirmed v8.415/sha=ae27243/ok=true. Pre-commit Explore review CLEAN. tsc clean. |
| 2026-05-08 | v7.835 | ff221b5 | 💰 GH Actions duplicate-deploy fix — disabled `push: branches: [main]` trigger on `.github/workflows/deploy.yml`; Vercel-native auto-deploy is now the sole deploy path. Per Shohei Maeda (Vercel Compute) 2026-05-07 advisory: scc-web was running ~3 deploys per commit. Estimated savings: 30-50% off build-minutes. Workflow kept as `workflow_dispatch:`-only manual-trigger backup. Verify-via-curl confirmed v7.835/sha=ff221b5/ok=true; bonus signal: `smsConfigured:true` + `emailConfigured:true` (Twilio + Resend env vars landed since queue audit). |
| 2026-05-07 | v4.945 | d493d95 | Kat-feedback batch 1: no-stacking sweep (mirror of greenlife-web v4.315). Strips "stacks with loyalty" / "stackable with loyalty" copy from page.tsx, deals/{[id],page}, heroes/{[cohort],page}, faq, llms-full.txt, LoyaltyArc, MenuActiveDealsStrip. New copy frames "Best deal applies — earn loyalty points either way." Pinned `feedback_no_stacking_ever` + `feedback_no_giveaways_period.md`. |
| 2026-05-07 | v4.935 | 4d0cc43 | `lib/loyalty-redemption.ts` field rename `discountFraction` → `discountPct` to match canonical inventoryapp. SSoT-tightening only — same numeric values + no consumer reads the field directly. |
| 2026-05-07 | v4.925 | e0bc3c8 | `/rewards/balance` drops local 13-line `normalizeToE164` duplicate, imports canonical from `@/lib/sms`. Pure SSoT-tightening. |
| 2026-05-07 | v4.915 | 7cafa36 | `/rewards/dashboard` + `/rewards/balance` adopt canonical 4-tier loyalty model (Visitor/Regular/Local/Family keyed on lifetime spend). Pre-fix had local Bronze/Silver/Gold helper keyed on POINTS — same customer would see different tier names on PWA vs POS receipt. |
| 2026-05-07 | v4.905 | 332bf65 | `/rewards` migration banner gains date-bounded sunset (2026-07-15 = Seattle cutover + 3wk margin). Auto-retires post-cutover so customers don't see "we're moving" months after migration is done. |
| 2026-05-07 | v4.895 | 2519f80 | Mirror 3 educational blog posts from greenlife-web (terpenes-101 + edibles-dosing + indica-vs-sativa) — closes PLAN_WEEKLY_GUIDES parity gap (was 2 posts, now 5). |
| 2026-05-07 | v4.885 | 7bcd1aa | a11y sweep round 3 — 5 data-driven `{icon}` / `{CAT_ICONS}` wrappers (homepage / OrderMenu / brands ×2 / about) |
| 2026-05-07 | v4.875 | 11e5d02 | a11y sweep mirror — /learn 🎓 + /visit `{b.emoji}` (mirror of greenlife-web v4.285) |
| 2026-05-07 | v4.865 | ef2de87 | Pre-Next.js legacy URL preservation — 10 redirects (/shop /products /flower /concentrates /edibles /pre-rolls /vapes → /menu · /strains → /find-your-strain · /book + /book-now → /order · /about-us → /about) |
| 2026-05-07 | v4.855 | 3073297 | SiteFooter Explore column — `/rewards` link added between Heroes Discount + Find your strain |
| 2026-05-07 | v4.845 | 5c14358 | /rewards/balance polish — SUCCESSOR FLOW comment cleanup + PII MINIMIZATION list correction + 🔍 a11y wrap |
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
