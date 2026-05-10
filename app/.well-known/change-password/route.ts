// W3C `/.well-known/change-password` — redirects browsers' password-manager
// suggestions ("Change weak password" in Safari Keychain / Chrome) to the
// actual password-change UI. Per https://w3c.github.io/webappsec-change-password-url/
//
// scc uses Twilio-OTP for customer rewards-portal auth (NO passwords stored
// per scc design). Without a password concept, "change password" maps to
// the next OTP-login flow at /rewards/login — which re-issues a fresh
// session via SMS code. Browser-suggested password rotations effectively
// become "log in again with a fresh OTP" which is the right re-auth shape
// for an OTP-based system.
//
// Static 303 ("See Other") is the canonical response shape per the spec.

import { redirect } from "next/navigation";

export const dynamic = "force-static";

export function GET() {
  redirect("/rewards/login");
}
