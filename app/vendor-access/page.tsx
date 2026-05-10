import type { Metadata } from "next";
import { VendorAccessForm } from "./VendorAccessForm";

export const metadata: Metadata = {
  // Drop brand — template appends. T27 catch.
  title: "Vendor portal access",
  description:
    "Are you a brand we carry (or want us to carry)? Request access to our vendor portal — upload product photos, brand kits, see what we're displaying.",
  alternates: { canonical: "/vendor-access" },
  robots: { index: true, follow: true },
};

export default function VendorAccessPage() {
  return (
    <>
      <div className="relative overflow-hidden bg-indigo-950 text-white py-10 sm:py-14">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(ellipse 60% 50% at 80% 50%, #818cf8, transparent)" }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-2">
            For brand partners
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Request vendor portal access
          </h1>
          <p className="text-indigo-200/80 mt-2 text-sm sm:text-base max-w-xl">
            For producers + processors we carry — or want to carry. Upload your product photos,
            logo, brand kit. See what we&apos;re currently displaying. Stop the email-zip-file
            dance.
          </p>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8">
          <VendorAccessForm />
        </div>

        <div className="mt-6 text-center text-stone-500 text-xs">
          Already have an account?{" "}
          <a
            href="https://brapp.seattlecannabis.co/vmi/login"
            className="text-indigo-700 font-semibold hover:underline"
          >
            Sign in to the vendor portal →
          </a>
        </div>
      </main>
    </>
  );
}
