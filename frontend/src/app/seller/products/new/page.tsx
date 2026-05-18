"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { createSellerProduct } from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";

const links = [
  { href: "/seller/dashboard", label: "Dashboard" },
  { href: "/seller/products", label: "Inventory" },
  { href: "/seller/orders", label: "Orders" },
  { href: "/seller/products/new", label: "Add Product" },
  { href: "/seller/account", label: "Account" },
];

export default function NewProductPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    const token = getStoredAuth().token;
    if (!token) {
      setMessage("Please login as seller first.");
      return;
    }

    const form = new FormData(event.currentTarget);
    try {
      await createSellerProduct(token, form);
      setMessage("Product publish request sent.");
      router.push("/seller/products");
    } catch {
      setMessage("Publish failed. Please check required fields.");
    }
  };

  return (
    <DashboardShell title="Add New Product" subtitle="Create and publish your listing." links={links}>
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-3xl font-semibold">Basic Information</h2>
          <input name="name" required className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Product Title" />
          <textarea name="description" className="h-32 w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Describe your product..." />
          <div className="grid gap-3 sm:grid-cols-3">
            <input name="price" type="number" step="0.01" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Price" />
            <input name="original_price" type="number" step="0.01" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Original Price" />
            <input name="stock" type="number" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Stock" />
            <select name="category" className="rounded-lg border border-slate-300 px-3 py-2">
              <option value="">No Category</option>
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Footwear">Footwear</option>
              <option value="Home Tech">Home Tech</option>
            </select>
            <select name="is_active" className="rounded-lg border border-slate-300 px-3 py-2">
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
          <h2 className="text-xl font-semibold">Product Status</h2>
          <p className="mt-2 text-slate-600">Visibility: Public</p>
          <button className="mt-4 w-full rounded-lg bg-brand-600 py-2 font-semibold text-white">
            Publish Product
          </button>
          {message ? <p className="mt-3 text-sm text-brand-600">{message}</p> : null}
        </aside>
      </form>
    </DashboardShell>
  );
}
