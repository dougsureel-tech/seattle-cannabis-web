import "server-only";

// Welcome email sender — branded transactional template fired the first
// time a Clerk-authenticated customer's `portal_users` sidecar row is
// inserted (i.e. once per account, ever). Mirrors the shape of
// `lib/order-confirmation-email.ts`: same `sendEmail()` primitive, same
// HTML escape, same env-var gate, same per-store palette.
//
// **Channel:** transactional (CAN-SPAM "transactional / relationship"
// category — sent in response to the user's own signup action). Footer
// still includes a STOP / `hi@` opt-out line for marketing-channel
// hygiene + parity with the order-confirmation template; one-click unsub
// will land alongside the inventoryapp `portal_users.email_opt_in`
// column migration.
//
// **Gating:** dispatch is gated by `WELCOME_EMAIL_ENABLED=true` at the
// call site (env-var pattern, default OFF). Same rationale as
// `ORDER_CONFIRMATION_EMAIL_ENABLED` — public-site repos have no read
// path into inventoryapp's `feature_flags` Postgres table, so the env
// var is the lightweight on/off switch Doug toggles in Vercel and
// re-deploys. See docs/email-infra.md.
//
// **Idempotency:** the caller must guarantee this fires at most once per
// portal-user row creation. Today that contract lives in
// `lib/portal.ts → getOrCreatePortalUser()` which returns a `created`
// flag derived from whether the SELECT-then-INSERT-on-conflict path hit
// an empty SELECT (true first-time signup) or an existing row (returning
// session). The Clerk webhook path is intentionally NOT used — it would
// fire on every `user.created` event regardless of whether our sidecar
// row was the new piece of state, and would require Svix signature infra
// we don't have set up.
//
// **XSS:** every user-controlled string (firstName) and every dynamic
// store string (storeName, storeAddress, mapUrl, hoursText,
// deepLinkOrder) is escaped via the local `safe()` helper before
// interpolation. Static template literals do not need escaping.
//
// **Failure mode:** never throws. On send failure we log a single line
// (no PII / no email address) and return — signup is already committed
// and the customer is already in `/account`.

import { sendEmail, isEmailConfigured } from "./email";
import { STORE } from "./store";

export type WelcomeEmailArgs = {
  to: string;
  firstName: string | null;
  storeName: string;
  storeAddress: string;
  mapUrl: string;
  hoursText: string;
  deepLinkOrder: string;
};

// Origin used for the strain-quiz CTA. Resolved from env so the link is
// absolute (email clients won't relative-resolve a `/find-your-strain`
// path) and falls back to the canonical apex if `NEXT_PUBLIC_SITE_URL`
// isn't set in the env. No trailing slash.
const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://seattlecannabis.co"
).replace(/\/+$/, "");

// Tiny HTML escape — keep self-contained so the file has no extra deps.
const safe = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]!));

// Seattle palette — matches the order-confirmation template + the
// SiteFooter indigo-950 → violet-950 gradient.
const COLORS = {
  bgPage: "#f5f5f4", // stone-100
  bgCard: "#ffffff",
  border: "#e7e5e4", // stone-200
  textBody: "#1c1917", // stone-900
  textMuted: "#57534e", // stone-600
  textFaint: "#78716c", // stone-500
  headerBg: "linear-gradient(135deg,#1e1b4b 0%,#3730a3 50%,#5b21b6 100%)", // indigo-950 → indigo-800 → violet-800
  headerText: "#ddd6fe", // violet-200
  accentText: "#4338ca", // indigo-700
  accentBg: "#eef2ff", // indigo-50
  buttonBg: "#4338ca", // indigo-700
  buttonText: "#ffffff",
  divider: "#e7e5e4",
} as const;

// Seattle static facts — kept in-file so the footer renders without
// pulling more from STORE than the args already give us. License is the
// WSLCB retailer license issued to Green Anne LLC (dba Seattle Cannabis Co.).
const PHONE_DISPLAY = "(206) 420-1042";
const PHONE_TEL = "+12064201042";
const WSLCB_LICENSE = "WSLCB License 426199";
// Customer-facing opt-out address. Pre-fix said "reply STOP or email
// hi@seattlecannabis.co" but `hi@` is the FROM address, not necessarily
// the monitored inbox. Per `project_seattle_rainier_email_monitored`
// memory, `rainier@` is the confirmed monitored inbox. Sister to
// greenlife-web v3.335. RESEND_REPLY_TO unset on Seattle so falls
// through to STORE.email = `rainier@seattlecannabis.co`.
const OPT_OUT_EMAIL = process.env.RESEND_REPLY_TO || STORE.email;

function buildHtml(args: WelcomeEmailArgs): string {
  const { firstName, storeName, storeAddress, mapUrl, hoursText, deepLinkOrder } = args;

  const greetingName = firstName ? safe(firstName) : "there";
  const safeStoreName = safe(storeName);
  const safeStoreAddress = safe(storeAddress);
  const safeMapUrl = safe(mapUrl);
  const safeHours = safe(hoursText);
  const safeDeepLink = safe(deepLinkOrder);
  const safeQuizUrl = safe(`${SITE_ORIGIN}/find-your-strain`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Welcome to ${safeStoreName}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.bgPage};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${COLORS.textBody};">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bgPage};padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${COLORS.bgCard};border:1px solid ${COLORS.border};border-radius:14px;overflow:hidden;">
      <tr><td style="background:${COLORS.headerBg};padding:24px 28px;">
        <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.headerText};font-weight:700;">
          ${safeStoreName} · Rainier Valley since 2018
        </p>
        <p style="margin:6px 0 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">
          Welcome, ${greetingName}.
        </p>
      </td></tr>

      <tr><td style="padding:28px 28px 8px;">
        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${COLORS.textBody};">
          Thanks for signing up. We've been a Seattle shop since 2010 and a
          Rainier Valley anchor since 2018 — well-curated menu, careful staff,
          and the smoothest pickup we know how to run. Your account is set up
          and you can place a pickup order any time.
        </p>

        <a href="${safeDeepLink}" style="display:inline-block;background:${COLORS.buttonBg};color:${COLORS.buttonText};font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;letter-spacing:0.02em;">
          Browse the menu
        </a>

        <div style="background:${COLORS.accentBg};border-radius:10px;padding:16px 18px;margin:22px 0 8px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${COLORS.accentText};">
            First-visit essentials
          </p>
          <p style="margin:0 0 6px;font-size:14px;color:${COLORS.textBody};line-height:1.55;">
            <strong>Cash only.</strong> Federal banking rules — there's an ATM in the lobby.
          </p>
          <p style="margin:0 0 6px;font-size:14px;color:${COLORS.textBody};line-height:1.55;">
            <strong>Bring ID, 21+.</strong> Government-issued. Every visit, every time — WSLCB rules.
          </p>
          <p style="margin:0;font-size:14px;color:${COLORS.textBody};line-height:1.55;">
            <strong>Hours:</strong> ${safeHours}
          </p>
        </div>

        <div style="border-top:1px solid ${COLORS.divider};padding-top:18px;margin-top:22px;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${COLORS.accentText};">
            Loyalty — every visit counts
          </p>
          <p style="margin:0 0 6px;font-size:14px;color:${COLORS.textBody};line-height:1.6;">
            Earn <strong>1 point per $1</strong> spent in store. Redeem
            <strong>100 points = $1 off</strong> your next visit. Tier progress
            runs <strong>Visitor → Regular → Local → Family</strong>, with
            perks at each step. Ask a budtender to start your card on your
            first visit — it takes about thirty seconds.
          </p>
        </div>

        <div style="border-top:1px solid ${COLORS.divider};padding-top:18px;margin-top:18px;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${COLORS.textMuted};">
            What you'll hear from us
          </p>
          <p style="margin:0;font-size:14px;color:${COLORS.textBody};line-height:1.6;">
            Order confirmations and the occasional drop note when something
            we love lands. That's it — no daily blast, no spam. Reply STOP
            any time and we'll honor it.
          </p>
        </div>

        <div style="border-top:1px solid ${COLORS.divider};padding-top:18px;margin-top:18px;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${COLORS.textMuted};">
            New to cannabis? Start here
          </p>
          <p style="margin:0;font-size:14px;color:${COLORS.textBody};line-height:1.6;">
            Our 60-second strain quiz gives you three things we'd actually
            recommend across the counter:
            <a href="${safeQuizUrl}" style="color:${COLORS.accentText};text-decoration:underline;font-weight:600;">${safeQuizUrl}</a>
          </p>
        </div>

        <p style="margin:24px 0 0;font-size:14px;color:${COLORS.textBody};line-height:1.6;">
          See you soon, ${greetingName} — we're open today ${safeHours}.
        </p>
        <p style="margin:10px 0 0;font-size:13px;color:${COLORS.textFaint};line-height:1.6;">
          Questions? Reply to this email — it goes straight to the team.
        </p>
      </td></tr>

      <tr><td style="padding:20px 28px 22px;border-top:1px solid ${COLORS.divider};background:${COLORS.bgPage};">
        <p style="margin:0 0 4px;font-size:12px;color:${COLORS.textMuted};line-height:1.55;font-weight:600;">
          ${safeStoreName}
        </p>
        <p style="margin:0 0 4px;font-size:12px;color:${COLORS.textMuted};line-height:1.55;">
          ${safeStoreAddress} ·
          <a href="${safeMapUrl}" style="color:${COLORS.accentText};text-decoration:underline;">Directions</a>
        </p>
        <p style="margin:0 0 10px;font-size:12px;color:${COLORS.textMuted};line-height:1.55;">
          <a href="tel:${PHONE_TEL}" style="color:${COLORS.accentText};text-decoration:none;">${PHONE_DISPLAY}</a>
          · ${WSLCB_LICENSE}
        </p>
        <p style="margin:0;font-size:11px;color:${COLORS.textFaint};line-height:1.55;">
          You're getting this because you just created an account at
          ${safeStoreName}. To stop future marketing emails, reply STOP or
          email
          <a href="mailto:${OPT_OUT_EMAIL}" style="color:${COLORS.accentText};text-decoration:underline;">${OPT_OUT_EMAIL}</a>.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function buildText(args: WelcomeEmailArgs): string {
  const { firstName, storeName, storeAddress, mapUrl, hoursText, deepLinkOrder } = args;
  const greeting = firstName ?? "there";
  return [
    `${storeName} — Rainier Valley since 2018`,
    "",
    `Welcome, ${greeting}.`,
    "",
    "Thanks for signing up. We've been a Seattle shop since 2010 and a",
    "Rainier Valley anchor since 2018 — well-curated menu, careful staff,",
    "and the smoothest pickup we know how to run. Your account is set up",
    "and you can place a pickup order any time.",
    "",
    `Browse the menu: ${deepLinkOrder}`,
    "",
    "First-visit essentials:",
    "  - Cash only. Federal banking rules — there's an ATM in the lobby.",
    "  - Bring ID, 21+. Government-issued, every visit, every time — WSLCB rules.",
    `  - Hours: ${hoursText}`,
    "",
    "Loyalty — every visit counts:",
    "  - Earn 1 point per $1 spent in store.",
    "  - Redeem 100 points = $1 off your next visit.",
    "  - Tiers: Visitor → Regular → Local → Family, with perks at each step.",
    "  - Ask a budtender to start your card on your first visit — about 30 seconds.",
    "",
    "What you'll hear from us:",
    "  Order confirmations + the occasional drop note. That's it — no spam.",
    "  Reply STOP any time.",
    "",
    `See you soon, ${greeting} — we're open today ${hoursText}.`,
    "Questions? Reply to this email — it goes straight to the team.",
    "",
    "—",
    `${storeName}`,
    `${storeAddress}`,
    `Directions: ${mapUrl}`,
    `${PHONE_DISPLAY} · ${WSLCB_LICENSE}`,
    "",
    `Welcome email from ${storeName}. To stop future marketing emails, reply STOP or email ${OPT_OUT_EMAIL}.`,
  ].join("\n");
}

/** Send a welcome email. Never throws. No-ops silently when:
 *  - `to` is empty / missing / lacks an `@`
 *  - `RESEND_API_KEY` is not configured (handled inside sendEmail)
 *  - `WELCOME_EMAIL_ENABLED` is not "true" (caller is responsible for the
 *    flag check; this helper performs a defense-in-depth re-check)
 *
 *  The CALLER also owns the once-per-portal-user contract — fire only when
 *  `getOrCreatePortalUser()` reports `created: true`. This helper has no
 *  way to verify that on its own. */
export async function sendWelcomeEmail(args: WelcomeEmailArgs): Promise<void> {
  if (!args.to || !args.to.includes("@")) {
    // No address on file — silent skip, no PII on this path.
    return;
  }
  if (process.env.WELCOME_EMAIL_ENABLED !== "true") {
    // Defense in depth — the caller already gates this, but if a refactor
    // ever drops the gate we still no-op rather than emailing customers
    // before Doug has flipped the env var ON.
    return;
  }
  if (!isEmailConfigured()) {
    // sendEmail() will log its own no-op line; no need to double-log here.
    return;
  }

  const subject = `Welcome to ${args.storeName}`;
  const html = buildHtml(args);
  const text = buildText(args);

  const result = await sendEmail({ to: args.to, subject, html, text });
  if (!result.ok && !result.skipped) {
    // Log without recipient — there's no orderId / portalUserId hook here
    // since we'd rather log nothing identifiable than a Clerk userId.
    console.error(`[welcome-email] send failed: ${result.error}`);
  }
}

// Re-export STORE to keep callers from importing it twice — purely for
// ergonomics; callers can also import directly from `@/lib/store`.
export { STORE };
