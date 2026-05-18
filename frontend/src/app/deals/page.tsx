import Link from "next/link";
import { StoreFooter } from "@/components/store-footer";
import { StoreHeader } from "@/components/store-header";
import { fetchProducts } from "@/lib/api";
import { getProductImageUrl } from "@/lib/product-images";
import { Product } from "@/lib/types";

export default async function DealsPage() {
  let products: Product[] = [];
  let loadError = "";
  try {
    products = await fetchProducts({ is_deal: "true" });
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Unable to load deals right now.";
  }

  return (
    <div>
      <StoreHeader />
      <main className="mx-auto min-h-[70vh] max-w-[1280px] px-6 py-10">
        <div className="mb-8 border-b border-slate-200 pb-6">
          <h1 className="text-4xl font-extrabold text-slate-900">Today&apos;s Deals</h1>
          <p className="mt-2 text-lg text-slate-600">
            Massive savings on premium products. Limited time only.
          </p>
        </div>

        {loadError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {loadError}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-600">
            <p className="text-xl font-medium">No active deals right now.</p>
            <p className="mt-2">Check back later for exciting discounts!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => {
              const imageUrl = getProductImageUrl(product);
              const isDeal = product.original_price && Number(product.original_price) > Number(product.price);
              
              let discountPercent = 0;
              if (isDeal) {
                const discountAmount = Number(product.original_price) - Number(product.price);
                discountPercent = Math.round((discountAmount / Number(product.original_price)) * 100);
              }

              return (
                <Link
                  href={`/products/${product.id}`}
                  key={product.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  {isDeal && (
                    <div className="absolute right-3 top-3 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      {discountPercent}% OFF
                    </div>
                  )}
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-56 w-full items-center justify-center bg-slate-100 text-sm text-slate-500">
                      No image
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      {product.category ?? "General"}
                    </p>
                    <h3 className="mt-2 line-clamp-2 min-h-[56px] text-lg font-bold leading-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="mt-auto pt-4 flex items-end justify-between">
                      <div>
                        {isDeal && (
                          <p className="text-sm text-slate-400 line-through mb-0.5">
                            ${Number(product.original_price).toFixed(2)}
                          </p>
                        )}
                        <p className="text-2xl font-black text-brand-600">
                          ${Number(product.price).toFixed(2)}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {product.stock} left
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <StoreFooter />
    </div>
  );
}
