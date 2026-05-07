"use client";

// DEPRECATED — V0 query-string lookup. Replaced by /rewards/login +
// /rewards/verify (OTP-gated). Kept here only so the /rewards/balance
// page still has a form to submit to during the cutover testing
// window. Once the OTP flow is verified end-to-end in production with
// real customer data, /rewards/balance + this form get deleted.

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LookupForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setErr("Please enter at least a 10-digit phone number.");
      return;
    }
    setErr(null);
    // Pass phone via query string. The balance page does the lookup.
    // Once the OTP table ships (Track B Week 1) this will instead POST
    // to /api/rewards/request-code and route to a verify step.
    router.push(`/rewards/balance?phone=${encodeURIComponent(digits)}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="phone"
          className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-2"
        >
          Phone number
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          inputMode="numeric"
          placeholder="(206) 555-0100"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
        />
      </div>

      {err && (
        <div role="alert" className="text-sm text-red-700 font-medium">
          {err}
        </div>
      )}

      <button
        type="submit"
        className="w-full rounded-2xl bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-3.5 text-base transition-all hover:-translate-y-0.5 shadow-md shadow-indigo-900/20"
      >
        Look up my points →
      </button>

      <p className="text-xs text-stone-400 text-center px-2">
        We&apos;ll show your first name, points balance, and tier — that&apos;s it.
        Nothing else from your account.
      </p>
    </form>
  );
}
