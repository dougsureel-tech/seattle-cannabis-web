"use client";

import { useEffect, useState } from "react";

const KEY = "sc_age_verified";
const TTL = 30 * 24 * 60 * 60 * 1000;

function isVerified(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    return Date.now() < parseInt(raw, 10);
  } catch {
    return false;
  }
}

function setVerified() {
  try {
    localStorage.setItem(KEY, String(Date.now() + TTL));
    document.cookie = `${KEY}=1; max-age=${TTL / 1000}; path=/; SameSite=Lax`;
  } catch {}
}

export function AgeGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isVerified()) setShow(true);
  }, []);

  if (!show) return null;

  function confirm() { setVerified(); setShow(false); }
  function deny() { window.location.href = "https://www.responsibility.org"; }

  return (
    <div
      role="dialog" aria-modal="true" aria-label="Age verification"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #1e1b4b 100%)" }}
    >
      <div className="max-w-sm w-full text-center space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-indigo-800/40 border border-indigo-600/40 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">SC</span>
          </div>
          <div>
            <p className="text-indigo-300 text-xs font-semibold uppercase tracking-widest">Seattle Cannabis Co.</p>
            <h1 className="text-white text-2xl font-bold mt-1">Seattle, WA</h1>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-white text-xl font-semibold">Are you 21 or older?</p>
          <p className="text-indigo-300/70 text-sm">You must be 21+ to enter this site.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={confirm}
            className="flex-1 py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400">
            Yes, I&apos;m 21+
          </button>
          <button onClick={deny}
            className="flex-1 py-3 px-6 rounded-xl border border-indigo-800 hover:border-indigo-600 text-indigo-400 hover:text-indigo-300 font-medium text-base transition-colors">
            No, exit
          </button>
        </div>

        <p className="text-indigo-800 text-xs">
          By entering you confirm you are of legal age to purchase cannabis in Washington State.
        </p>
      </div>
    </div>
  );
}
