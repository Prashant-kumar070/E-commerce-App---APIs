"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  fetchSellerProducts,
  listFromPaginated,
  updateSellerProduct,
} from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";
import { Product } from "@/lib/types";

const links = [
  { href: "/seller/dashboard", label: "Dashboard" },
  { href: "/seller/products", label: "Inventory" },
  { href: "/seller/orders", label: "Orders" },
  { href: "/seller/products/new", label: "Add Product" },
  { href: "/seller/account", label: "Account" },
];

type EditProductPageProps = {
  params: { id: string };
};

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getStoredAuth().token;
    if (!token) {
      setMessage("Please login as seller first.");
      return;
    }

    fetchSellerProducts(token)
      .then((data) => {
        const items = listFromPaginated<Product>(data);
        const selected = items.find((item) => String(item.id) === params.id);
        if (selected) {
          setProduct(selected);
        } else {
          setMessage("Product not found in your seller inventory.");
        }
      })
      .catch(() => setMessage("Unable to load product details."));
  }, [params.id]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = getStoredAuth().token;
    if (!token) {
      setMessage("Please login as seller first.");
      return;
    }

    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await updateSellerProduct(token, params.id, form);
      setMessage("Product updated successfully.");
      router.push("/seller/products");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell title="Edit Product" subtitle="Update listing information." links={links}>
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-3xl font-semibold">Product Details</h2>
          <input
            name="name"
            required
            defaultValue={product?.name}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Product Title"
          />
          <textarea
            name="description"
            defaultValue={product?.description ?? ""}
            className="h-32 w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Describe your product..."
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              name="price"
              type="number"
              step="0.01"
              defaultValue={product?.price}
              className="rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Price"
            />
            <input
              name="original_price"
              type="number"
              step="0.01"
              defaultValue={product?.original_price}
              className="rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Original Price"
            />
            <input
              name="stock"
              type="number"
              defaultValue={product?.stock}
              className="rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Stock"
            />
            <select
              name="category"
              defaultValue={product?.category ?? ""}
              className="rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="">No Category</option>
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Footwear">Footwear</option>
              <option value="Home Tech">Home Tech</option>
            </select>
            <select
              name="is_active"
              defaultValue={product?.is_active === false ? "0" : "1"}
              className="rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="1">Active</option>
              <option value="0">Draft</option>
            </select>
          </div>
          <input
            name="image"
            type="file"
            accept="image/*"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </section>

        <aside className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-semibold">Save Changes</h2>
          <p className="mt-2 text-slate-600">Update this product in seller inventory.</p>
          <button
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-brand-600 py-2 font-semibold text-white disabled:opacity-70"
          >
            {loading ? "Updating..." : "Update Product"}
          </button>
          {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
        </aside>
      </form>
    </DashboardShell>
  );
}
