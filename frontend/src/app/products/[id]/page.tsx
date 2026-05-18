import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductAddToCart } from "@/components/product-add-to-cart";
import { StoreFooter } from "@/components/store-footer";
import { StoreHeader } from "@/components/store-header";
import { fetchProductById } from "@/lib/api";
import { getProductImageUrl } from "@/lib/product-images";

type ProductPageProps = {
  params: { id: string };
};

export default async function ProductDetailsPage({ params }: ProductPageProps) {
  let product;
  try {
    product = await fetchProductById(params.id);
  } catch {
    notFound();
  }

  const imageUrl = getProductImageUrl(product);
  const stock = Number(product.stock);
  const inStock = stock > 0;
  const price = Number(product.price);

  return (
    <div>
      <StoreHeader />
      <main className="mx-auto max-w-[1280px] px-6 py-6">
        <nav className="mb-4 text-sm text-slate-500">
          <Link href="/" className="hover:text-brand-600">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">{product.name}</span>
        </nav>
        <div className="grid gap-7 lg:grid-cols-2">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="h-[560px] w-full rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-[560px] w-full items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              No product image
            </div>
          )}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                inStock ? "bg-[#56fbab] text-[#007146]" : "bg-slate-200 text-slate-700"
              }`}
            >
              {inStock ? "IN STOCK" : "OUT OF STOCK"}
            </span>
            <h1 className="mt-3 text-5xl font-bold">{product.name}</h1>
            {product.description ? (
              <p className="mt-2 text-slate-600">{product.description}</p>
            ) : null}
            <p className="mt-6 text-4xl font-bold text-brand-600">${price.toFixed(2)}</p>
            <p className="mt-2 text-sm text-slate-500">{stock} units available</p>
            <ProductAddToCart productId={product.id} disabled={!inStock} />
          </div>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
