import Link from "next/link";
import { StoreFooter } from "@/components/store-footer";
import { StoreHeader } from "@/components/store-header";
import { fetchProducts } from "@/lib/api";
import { getProductImageUrl } from "@/lib/product-images";
import { Product } from "@/lib/types";

const CATEGORIES = [
  { name: "Electronics", color: "bg-blue-100 text-blue-800", border: "border-blue-200" },
  { name: "Fashion", color: "bg-pink-100 text-pink-800", border: "border-pink-200" },
  { name: "Footwear", color: "bg-amber-100 text-amber-800", border: "border-amber-200" },
  { name: "Home Tech", color: "bg-teal-100 text-teal-800", border: "border-teal-200" },
];

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const currentCategory = searchParams.category;
  let products: Product[] = [];
  let loadError = "";

  try {
    const query = currentCategory ? { category: currentCategory } : {};
    products = await fetchProducts(query);
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Unable to load products right now.";
  }

  return (
    <div>
      <StoreHeader />
      <main className="mx-auto min-h-[70vh] max-w-[1280px] px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900">Explore Categories</h1>
          <p className="mt-2 text-lg text-slate-600">
            Find exactly what you are looking for by browsing our curated collections.
          </p>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const isActive = currentCategory === cat.name;
            return (
              <Link
                key={cat.name}
                href={isActive ? "/categories" : `/categories?category=${encodeURIComponent(cat.name)}`}
                className={`flex h-24 items-center justify-center rounded-xl border-2 font-bold transition-all hover:shadow-md ${
                  isActive 
                    ? "border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-600 ring-offset-2" 
                    : `${cat.color} ${cat.border} hover:-translate-y-1`
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        <div className="border-t border-slate-200 pt-8">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            {currentCategory ? `${currentCategory} Products` : "All Products"}
          </h2>

          {loadError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {loadError}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-600">
              <p className="text-xl font-medium">No products found in this category.</p>
              <p className="mt-2">Try selecting a different category above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => {
                const imageUrl = getProductImageUrl(product);
                return (
                  <Link
                    href={`/products/${product.id}`}
                    key={product.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
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
                        <p className="text-2xl font-black text-brand-600">
                          ${Number(product.price).toFixed(2)}
                        </p>
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
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
