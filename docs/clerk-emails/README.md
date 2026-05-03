# Clerk email templates — Seattle Cannabis Co.

Each `.html` file in this folder is a brand-styled email template for one Clerk email type. Paste the body into the Clerk dashboard for the **Seattle** instance.

## Where they go in Clerk

1. https://dashboard.clerk.com → select the **Seattle** instance
   (verify Frontend API host = `clerk.seattlecannabis.co` BEFORE clicking anything)
2. **Customization** → **Emails** → pick the template
3. Switch to "HTML" mode (not Markdown)
4. Paste the file body
5. Save

## Template ↔ Clerk template name

| File | Clerk template name |
|---|---|
| `verification-code-signup.html` | "Verification code" (used at sign-up) |
| `reset-password-code.html` | "Reset password code" |
| `welcome.html` | "Welcome" (optional — toggle on if you want it) |

## Variables used

These match Clerk's default template variables — leave the `{{...}}` syntax intact, Clerk fills them in at send time.

- `{{otp_code}}` — the 6-digit code
- `{{user.first_name}}` — first name from sign-up form
- `{{app.name}}` — set this to "Seattle Cannabis Co." in Clerk dashboard if not already

## Brand voice notes

- "We" not "I" for any product/offering language (per `feedback_staff_voice_we_not_i`).
- Seattle positioning leads with **founded 2010, Rainier Valley since 2018** + **locally owned, independent** (per `project_seattle_founding`).
- All copy was reviewed for WAC 314-55-077 (no health/medical claims) and WAC 314-55-155 (no advertising-style content in transactional emails).

## Sister docs

Wenatchee templates at `greenlife-web/docs/clerk-emails/` — same shape, green palette, Wenatchee copy.
