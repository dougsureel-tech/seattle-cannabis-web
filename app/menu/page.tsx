import type { Metadata } from "next";
import { STORE } from "@/lib/store";
import { JaneMenu } from "./JaneMenu";

export const metadata: Metadata = {
  title: "Menu",
  description: `Browse ${STORE.name}'s full cannabis menu — flower, edibles, vapes, concentrates, pre-rolls, and tinctures. Seattle, WA.`,
  alternates: { canonical: "/menu" },
};

export default function MenuPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-indigo-950 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold">Our Menu</h1>
          <p className="text-indigo-300/80 mt-1 text-sm">
            {STORE.address.city}, WA · Updated daily · Must be 21+ to purchase
          </p>
        </div>
      </div>
      {STORE.iheartjaneStoreId > 0 ? (
        <JaneMenu storeId={STORE.iheartjaneStoreId} />
      ) : (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center space-y-4">
          <p className="text-stone-500">Menu coming soon — call us for today&apos;s selection.</p>
          {STORE.phone !== "TODO — add phone" && (
            <a href={`tel:${STORE.phoneTel}`} className="inline-block px-5 py-2.5 rounded-xl bg-indigo-800 text-white font-medium text-sm hover:bg-indigo-700 transition-colors">
              Call {STORE.phone}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
