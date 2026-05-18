import Link from "next/link";
import { StoreFooter } from "@/components/store-footer";
import { StoreHeader } from "@/components/store-header";
import { fetchProducts } from "@/lib/api";
import { getProductImageUrl } from "@/lib/product-images";
import { ProductSearch } from "@/components/product-search";
import { Product } from "@/lib/types";

export default async function Home({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  let products: Product[] = [];
  let loadError = "";
  try {
    products = await fetchProducts({ search: searchParams.search });
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Unable to load products right now.";
  }

  return (
    <div>
      <StoreHeader />
      <main className="mx-auto max-w-[1280px] px-6 py-5">
        <section className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 p-8 text-white shadow-soft">
          <p className="mb-3 inline-block rounded-full bg-[#56fbab] px-3 py-1 text-xs font-semibold text-[#007146]">
            LIMITED TIME
          </p>
          <h1 className="text-4xl font-bold">SwiftMarket Seasonal Refresh</h1>
          <p className="mt-3 max-w-xl text-blue-100">
            Elevate your lifestyle with up to 40% off on premium electronics and
            designer home essentials.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/deals"
              className="rounded-lg bg-white px-5 py-2 font-semibold text-brand-600"
            >
              Shop Deals
            </Link>
            <Link
              href="/categories"
              className="rounded-lg border border-blue-200 px-5 py-2 font-semibold text-white"
            >
              Explore Categories
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold">New Arrivals</h2>
            <div className="flex items-center gap-4">
              <ProductSearch />
              <Link href="/cart" className="whitespace-nowrap text-sm font-medium text-brand-600">
                View Cart
              </Link>
            </div>
          </div>
          {loadError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {loadError}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
              No products available yet from API.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => {
                const imageUrl = getProductImageUrl(product);
                return (
                  <Link
                    href={`/products/${product.id}`}
                    key={product.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="h-52 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-52 w-full items-center justify-center bg-slate-100 text-sm text-slate-500">
                        No image
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        {product.category ?? "General"}
                      </p>
                      <h3 className="mt-1 line-clamp-2 min-h-[48px] text-base font-semibold">
                        {product.name}
                      </h3>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-lg font-bold text-brand-600">
                          ${Number(product.price).toFixed(2)}
                        </p>
                        <span className="text-xs text-slate-500">Stock: {product.stock}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-xl bg-[#dce9ff] p-6">
          <h3 className="text-2xl font-semibold">Join the SwiftMarket Insider</h3>
          <p className="mt-2 text-slate-600">
            Get early access to drops, exclusive discounts, and personalized
            recommendations.
          </p>
          <div className="mt-4 flex max-w-md gap-2">
            <input
              placeholder="Enter your email"
              className="w-full rounded-lg border border-slate-300 px-4 py-2"
            />
            <button className="rounded-lg bg-brand-600 px-5 py-2 font-medium text-white">
              Subscribe
            </button>
          </div>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
