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
  const [leaving, setLeaving] = useState(false);

  // localStorage isn't available during SSR, so verification status must be checked post-mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (!isVerified()) setShow(true);
  }, []);

  if (!show) return null;

  function confirm() {
    setVerified();
    setShow(false);
  }

  function deny() {
    setLeaving(true);
    setTimeout(() => { window.location.href = "https://www.responsibility.org"; }, 400);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Age verification"
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
    >
      {/* Background */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(160deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)" }}>
        {/* subtle dot grid */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        {/* glow */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(ellipse 60% 50% at 50% 80%, #818cf8, transparent)" }} />
      </div>

      {/* Card */}
      <div className={`relative w-full sm:max-w-md mx-4 sm:mx-auto bg-indigo-950/90 backdrop-blur-sm border border-indigo-800/60 rounded-t-3xl sm:rounded-3xl px-8 py-10 text-center space-y-7 shadow-2xl transition-transform duration-300 ${leaving ? "translate-y-4 opacity-0" : ""}`}>
        {/* Logo mark */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-700/50 border border-indigo-600/40 flex items-center justify-center">
            <span className="text-indigo-200 font-extrabold text-xl tracking-tight">SC</span>
          </div>
          <div>
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Seattle Cannabis Co.</p>
            <p className="text-indigo-200/60 text-xs mt-0.5">Seattle, Washington</p>
          </div>
        </div>

        {/* Question */}
        <div className="space-y-2">
          <h1 className="text-white text-2xl font-extrabold tracking-tight">Are you 21 or older?</h1>
          <p className="text-indigo-300/60 text-sm">Washington State law requires you to be 21+ to purchase cannabis.</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={confirm}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 text-white font-bold text-base transition-all shadow-lg shadow-indigo-900/40 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-indigo-950">
            Yes, I&apos;m 21+
          </button>
          <button onClick={deny}
            className="flex-1 py-3.5 px-6 rounded-2xl border border-indigo-800 hover:border-indigo-700 hover:bg-indigo-900/40 text-indigo-400 hover:text-indigo-300 font-semibold text-base transition-all focus:outline-none focus:ring-2 focus:ring-indigo-800">
            No, exit
          </button>
        </div>

        <p className="text-indigo-900 text-xs leading-relaxed">
          By entering you confirm you are of legal age to purchase cannabis in Washington State.
        </p>
      </div>
    </div>
  );
}
