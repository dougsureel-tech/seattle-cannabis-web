import "server-only";

// Resend email sender for the public site — no-ops gracefully if
// RESEND_API_KEY is not set. Mirrors `lib/sms.ts` (Twilio no-op pattern)
// and the inventoryapp helper at `src/lib/email.ts` so the codebases use
// identical primitives.
//
// What this exists for:
// - Hack #6 strain-finder quiz nurture (capture → email follow-up)
// - Future order-confirmation emails on /order/confirmation
// - Future marketing nurture series (loyalty welcome, deal digest)
// - Customer welcome emails post-Clerk-signup
//
// **Customer state architecture:** customer accounts are a hybrid of
// Clerk (auth + email/profile) + a `portal_users` sidecar Postgres row
// (loyalty/SMS/order-history). For email opt-in we use the sidecar
// (`portal_users.email_opt_in` BOOLEAN, default FALSE) — see Phase 2 of
// this ship. Do NOT store opt-in in Clerk metadata; the sidecar already
// owns sms_opt_in + we want a single read for both channels.
//
// **XSS responsibility:** the `html` field is sent verbatim to Resend.
// Callers MUST escape any user-supplied content before interpolating it
// into the template literal — the helper does NOT sanitize. For static
// transactional templates (order receipt, welcome) this is fine. If
// echoing back a user's name / search query, escape with a tiny helper:
//   const safe = (s: string) => s.replace(/[&<>"']/g, c => ({
//     "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;",
//   }[c]!));
//
// **No PII on the no-op path:** if RESEND_API_KEY is missing we log a
// single info line WITHOUT the recipient address. The error string is
// safe to include in logs.

// Function-resolved env reads instead of module-init constants.
// Sister of inv v401.505 + cannagent v6.4565 (stale-Fluid-Compute-instance
// env-var trap): Vercel Fluid Compute keeps warm serverless instances
// ~15min, but `const X = process.env.Y` at module load captures the value
// ONCE per instance — admin env rotations don't reach instances loaded
// with the previous value until they cycle. Function-resolution reads
// `process.env` on every call (zero perf cost — process.env is a Proxy
// getter). Memory pin: `feedback_env_var_precedence_cross_tenant_trap`.
// Caused the inv 2026-05-11 Jensine welcome-email failure cascade —
// staff-bulk-reissue sent from stale send.subdomain (unverified at Resend)
// for ~30min after env-flip until instances cycled. Probe-side reports
// emailFromAtRisk based on these getters so they agree with send code.
function getApiKey(): string | undefined { return process.env.RESEND_API_KEY; }
function getDefaultFrom(): string {
  return process.env.RESEND_FROM || "Seattle Cannabis Co. <hi@seattlecannabis.co>";
}
// Reply-To override. When set, customer replies to outbound mail land
// here instead of the From address. Mirror of greenlife-web — kept
// symmetric so both repos behave identically. Seattle's From
// (rainier@seattlecannabis.co) is actively monitored as of 2026-05-04
// so this env var is currently unset on the SCC project, but the
// support is wired so future routing changes don't need code edits.
function getDefaultReplyTo(): string | null { return process.env.RESEND_REPLY_TO ?? null; }

export type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  /**
   * Per-recipient unsubscribe URL. When set, sendEmail emits two
   * RFC-8058-compliant Resend headers:
   *   - `List-Unsubscribe: <${url}>, <mailto:${REPLY_TO}?subject=Unsubscribe>`
   *   - `List-Unsubscribe-Post: List-Unsubscribe=One-Click`
   * Per Gmail's Feb 2024 bulk-sender requirements. Sister of glw same-file fix.
   */
  unsubscribeUrl?: string;
};

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string; skipped?: boolean };

/** True when RESEND_API_KEY is set. Use to gate UI copy that promises an
 *  email ("we'll email you a copy") so we don't lie to customers when
 *  the env var is absent in a given environment. */
export function isEmailConfigured(): boolean {
  return !!getApiKey();
}

/**
 * Cross-stack readiness probe — paired with `getEmailFromHost()` on
 * `/api/health`. Sister of cannagent v6.4585 + inv v401.305.
 *
 * Returns `true` when RESEND_FROM is set to the bare apex
 * `seattlecannabis.co` — which routes apex MX → Microsoft 365 inbound
 * (per dig MX seattlecannabis.co → seattlecannabis-co.mail.protection.outlook.com).
 * That's a DKIM/SPF/DMARC misalignment risk: Resend signs from its
 * relay infrastructure, but the apex's authoritative MX path points
 * at M365 — receiving Gmail/Apple Mail/Outlook clients may spam-
 * folder or bounce. See memory pin
 * `feedback_resend_apex_vs_send_subdomain_trap` (Jensine welcome-
 * email incident 2026-05-11 — burned 3hr on inv before diag endpoint
 * surfaced root cause).
 *
 * Returns:
 *   - `null` when RESEND_API_KEY isn't set (nothing to validate)
 *   - `false` when from-host is `send.seattlecannabis.co` or another
 *     verified subdomain (correct shape)
 *   - `true` when from-host equals bare apex `seattlecannabis.co`
 *     (at-risk — flip env to send.subdomain)
 *
 * **Doug-action follow-up if at-risk:**
 *   `vercel env rm RESEND_FROM production --yes && \
 *    echo "Seattle Cannabis Co. <hi@send.seattlecannabis.co>" | \
 *    vercel env add RESEND_FROM production`
 *  Then redeploy. Note: requires verifying `send.seattlecannabis.co`
 *  at the Resend dashboard first (DNS-side TXT + DKIM records).
 */
export function isEmailFromAtRisk(): boolean | null {
  if (!getApiKey()) return null;
  const configured = process.env.RESEND_FROM?.trim();
  if (!configured) {
    // Code default is `hi@seattlecannabis.co` (apex) — AT-RISK by default
    // until env var is set OR code-default flipped (see cannagent v6.4565
    // for the code-default-flip pattern). Surface this honestly.
    return true;
  }
  // Parse host from either `Name <addr@host>` or `addr@host`.
  const angleMatch = configured.match(/<([^>]+@([^>]+))>/);
  const bareMatch = configured.match(/([^\s]+@([^\s]+))/);
  const host = (angleMatch?.[2] || bareMatch?.[2] || "").trim().toLowerCase();
  if (!host) return null;
  return host === "seattlecannabis.co";
}

/**
 * Returns the parsed from-host (domain portion only — PII-safe, no
 * local-part). Paired with `isEmailFromAtRisk()` on `/api/health`.
 */
export function getEmailFromHost(): string | null {
  if (!getApiKey()) return null;
  const configured = process.env.RESEND_FROM?.trim();
  if (!configured) return "seattlecannabis.co"; // code-default apex
  const angleMatch = configured.match(/<([^>]+@([^>]+))>/);
  const bareMatch = configured.match(/([^\s]+@([^\s]+))/);
  return (angleMatch?.[2] || bareMatch?.[2] || "").trim().toLowerCase() || null;
}

/** Send an email via Resend. Returns `{ ok: true, id }` on success,
 *  `{ ok: false, error, skipped: true }` when RESEND_API_KEY is unset
 *  (graceful no-op for local dev / preview envs without the key), and
 *  `{ ok: false, error }` on a real send failure. Never throws. */
export async function sendEmail(args: SendEmailArgs): Promise<SendEmailResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    // Single info line, NO recipient address — keeps PII out of logs in
    // the no-op path which is the most common path in dev / preview.
    console.info("[email] RESEND_API_KEY not configured — skipping send");
    return {
      ok: false,
      skipped: true,
      error: "RESEND_API_KEY not configured",
    };
  }

  try {
    const { Resend } = await import("resend");
    const client = new Resend(apiKey);
    const replyTo = args.replyTo ?? getDefaultReplyTo() ?? undefined;
    const headers: Record<string, string> | undefined = args.unsubscribeUrl
      ? (() => {
          const mailtoSource = replyTo || args.from || getDefaultFrom();
          const angleMatch = mailtoSource.match(/<([^>]+)>/);
          const bareEmail = angleMatch ? angleMatch[1] : mailtoSource;
          return {
            "List-Unsubscribe": `<${args.unsubscribeUrl}>, <mailto:${bareEmail}?subject=Unsubscribe>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          };
        })()
      : undefined;
    const r = await client.emails.send({
      from: args.from ?? getDefaultFrom(),
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
      // Per-call replyTo wins when supplied; otherwise fall through to
      // the env-var default; otherwise undefined (Resend defaults to From).
      replyTo,
      ...(headers ? { headers } : {}),
    });
    // Resend v4 returns a discriminated union: { data, error: null } on
    // success or { data: null, error: ErrorResponse } on failure — does
    // NOT throw. Pre-fix the success-path code skipped the error branch
    // entirely and fell through to "no message id", silently swallowing
    // the diagnostic info on every Resend rejection (unverified domain,
    // rate-limit, invalid recipient, etc.). Sister of inv v305.205 fix
    // (project_resend_silent_failure_2026_05_08.md). Use `error.name`
    // (typed code key) NOT `error.message` (may echo recipient address →
    // PII into Vercel logs).
    const errResp = (r as { error?: { name?: string; message?: string } | null }).error;
    if (errResp) {
      const errName = errResp.name ?? "ResendError";
      console.error(`[email] send rejected: ${errName}`);
      return { ok: false, error: errName };
    }
    const id =
      (r as { data?: { id?: string }; id?: string }).data?.id ??
      (r as { id?: string }).id ??
      null;
    if (!id) {
      return { ok: false, error: "Resend returned no message id" };
    }
    return { ok: true, id };
  } catch (e) {
    // Format-only — Resend SDK errors echo the recipient address in
    // .message ("domain not verified for foo@example.com" / "rate
    // limited 3000/day for foo@example.com"). Vercel logs aren't
    // sensitive-PII-segregated; logging full error surfaces customer
    // email PII. Return + log err.name (class only). All callers inherit
    // the tightened result.error string. Sister of glw same-file fix.
    const errName = e instanceof Error ? e.name : "Error";
    console.error(`[email] send failed: ${errName}`);
    return { ok: false, error: errName };
  }
}
