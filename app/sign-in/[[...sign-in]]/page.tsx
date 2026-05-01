import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export const metadata = { title: "Sign In" };

export default function SignInPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 sm:py-16 bg-gradient-to-b from-stone-50 to-stone-100">
      <div className="w-full max-w-md space-y-5">
        {/* Branding header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-700 mb-3">
            <span className="text-indigo-200 font-extrabold text-lg tracking-tight">SC</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-700">Seattle Cannabis Co.</p>
          <h1 className="text-2xl font-extrabold text-stone-900">Welcome back</h1>
          <p className="text-sm text-stone-500">Sign in to track orders and earn loyalty points</p>
        </div>

        <SignIn />

        <div className="text-center">
          <Link href="/" className="text-xs text-stone-400 hover:text-indigo-700 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
