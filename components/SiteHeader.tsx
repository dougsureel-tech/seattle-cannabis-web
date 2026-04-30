"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { STORE } from "@/lib/store";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/order", label: "Order" },
  { href: "/menu", label: "Menu" },
  { href: "/brands", label: "Brands" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setOpen(false)}>
          <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center">
            <span className="text-white font-bold text-xs">SC</span>
          </div>
          <span className="font-bold text-indigo-900 text-lg leading-tight">
            Seattle <span className="font-normal text-indigo-600">Cannabis Co.</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === href || (href !== "/" && pathname.startsWith(href))
                  ? "bg-indigo-100 text-indigo-800"
                  : "text-stone-600 hover:text-indigo-800 hover:bg-indigo-50"
              }`}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a href={`tel:${STORE.phoneTel}`} className="text-sm text-stone-500 hover:text-indigo-700 transition-colors">
            {STORE.phone}
          </a>
          <Link href="/account" className="p-2 rounded-lg text-stone-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors" title="My Account">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
          <Link href="/order" className="px-4 py-2 rounded-xl bg-indigo-800 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors">
            Order Now
          </Link>
        </div>

        <button className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
          onClick={() => setOpen((v) => !v)} aria-label={open ? "Close menu" : "Open menu"}>
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-1">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === href || (href !== "/" && pathname.startsWith(href))
                  ? "bg-indigo-100 text-indigo-800"
                  : "text-stone-600 hover:bg-indigo-50 hover:text-indigo-800"
              }`}>
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-stone-100 mt-2 flex flex-col gap-2">
            <Link href="/account" onClick={() => setOpen(false)}
              className="block text-center px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-sm font-medium">
              My Account
            </Link>
            <Link href="/order" onClick={() => setOpen(false)}
              className="block text-center px-4 py-2 rounded-xl bg-indigo-800 text-white text-sm font-semibold">
              Order Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
