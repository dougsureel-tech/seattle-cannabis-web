import type { Metadata } from "next";
import Link from "next/link";
import { getActiveBrands } from "@/lib/db";
import { STORE } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Brands",
  description: `Explore all cannabis brands carried at ${STORE.name} in Rainier Valley, Seattle WA. Click any brand to see their products on our menu.`,
  alternates: { canonical: "/brands" },
};

export default async function BrandsPage() {
  const brands = await getActiveBrands().catch(() => []);
  const withLogo = brands.filter((b) => b.logoUrl);
  const withoutLogo = brands.filter((b) => !b.logoUrl);

  const brandsUrl = `${STORE.website}/brands`;
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${brandsUrl}#page`,
    name: `Cannabis Brands at ${STORE.name}`,
    description: `${brands.length} cannabis brands carried at ${STORE.name} in ${STORE.neighborhood}, Seattle WA. ${brands.reduce((s, b) => s + b.activeSkus, 0)} active products.`,
    url: brandsUrl,
    isPartOf: { "@id": `${STORE.website}/#dispensary` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: brands.length,
      itemListElement: brands.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Brand",
          name: b.name,
          url: `${STORE.website}/brands/${b.slug}`,
          ...(b.logoUrl ? { logo: b.logoUrl } : {}),
        },
      })),
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
        { "@type": "ListItem", position: 2, name: "Brands", item: brandsUrl },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
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
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">Our Shelves</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Brands We Carry</h1>
          <p className="text-indigo-300/70 mt-2 text-sm sm:text-base">
            {brands.length > 0
              ? `${brands.length} brands · ${brands.reduce((s, b) => s + b.activeSkus, 0)} active products · Rainier Valley, Seattle`
              : "Washington's best producers, handpicked for you"}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        {brands.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="text-5xl">🌿</div>
            <p className="text-xl font-semibold text-stone-700">Brands loading soon</p>
            <p className="text-stone-400 text-sm">Check back or browse our full menu</p>
            <a
              href={STORE.shopUrl}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors"
            >
              Shop Menu →
            </a>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-10">
            {withLogo.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {withLogo.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/brands/${brand.slug}`}
                    className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-stone-100 bg-white hover:border-indigo-300 hover:shadow-md transition-all text-center"
                  >
                    <div className="h-14 w-full flex items-center justify-center">
                      <img
                        src={brand.logoUrl!}
                        alt={brand.name}
                        className="max-h-14 max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-stone-800 group-hover:text-indigo-800 text-sm transition-colors leading-tight">
                        {brand.name}
                      </div>
                      <div className="text-xs text-stone-400 mt-0.5">
                        {brand.activeSkus} product{brand.activeSkus !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {withoutLogo.length > 0 && (
              <div>
                {withLogo.length > 0 && (
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-px flex-1 bg-stone-200" />
                    <span className="text-xs text-stone-400 font-medium uppercase tracking-widest">
                      More Brands
                    </span>
                    <div className="h-px flex-1 bg-stone-200" />
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {withoutLogo.map((brand) => (
                    <Link
                      key={brand.id}
                      href={`/brands/${brand.slug}`}
                      className="group flex flex-col items-center gap-2 p-4 rounded-2xl border border-stone-100 bg-white hover:border-indigo-300 hover:shadow-sm transition-all text-center"
                    >
                      <div className="h-12 w-full flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                        <span className="text-indigo-800 font-bold text-xs leading-tight px-2 text-center line-clamp-2">
                          {brand.name}
                        </span>
                      </div>
                      <div className="text-xs text-stone-400">
                        {brand.activeSkus} product{brand.activeSkus !== 1 ? "s" : ""}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center pt-4">
              <a
                href={STORE.shopUrl}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-stone-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm font-semibold text-stone-700 hover:text-indigo-800 transition-all"
              >
                Browse All Products Online →
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
