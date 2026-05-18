"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ADMIN_SHELL_LINKS } from "@/lib/admin-links";
import { fetchAdminProductById, updateAdminProduct } from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";
import { Product } from "@/lib/types";

type Props = { params: { id: string } };

export default function AdminInventoryEditPage({ params }: Props) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "0",
    is_active: true,
  });
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    const token = getStoredAuth().token;
    if (!token) return;
    fetchAdminProductById(token, params.id)
      .then((p) => {
        setProduct(p);
        setForm({
          name: p.name,
          description: p.description ?? "",
          price: String(p.price),
          stock: String(p.stock),
          is_active: p.is_active !== false,
        });
      })
      .catch((e) => setMessage(e instanceof Error ? e.message : "Failed to load product."));
  }, [params.id]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = getStoredAuth().token;
    if (!token) return;
    setSubmitting(true);
    setMessage("");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      if (form.description) fd.append("description", form.description);
      fd.append("price", form.price);
      fd.append("stock", form.stock);
      fd.append("is_active", form.is_active ? "1" : "0");
      if (image) fd.append("image", image);
      await updateAdminProduct(token, params.id, fd);
      router.push("/admin/inventory");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell title="Edit product" subtitle={product?.name ?? "…"} links={ADMIN_SHELL_LINKS}>
      {!product && !message ? <p className="text-slate-600">Loading…</p> : null}
      {message && !product ? <p className="text-red-600">{message}</p> : null}

      {product ? (
        <form onSubmit={onSubmit} className="max-w-lg space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          {message && product ? <p className="text-sm text-red-600">{message}</p> : null}
          <p className="text-sm text-slate-600">
            Seller: <span className="font-medium">{product.seller?.name ?? `#${product.seller_id}`}</span>
          </p>
          <div>
            <label className="text-sm font-medium text-slate-700">Name</label>
            <input
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Price</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Stock</label>
              <input
                required
                type="number"
                min="0"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            />
            Active
          </label>
          <div>
            <label className="text-sm font-medium text-slate-700">Replace image (optional)</label>
            <input type="file" accept="image/*" className="mt-1 w-full text-sm" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white">
              {submitting ? "Saving…" : "Save"}
            </button>
            <Link href="/admin/inventory" className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700">
              Cancel
            </Link>
          </div>
        </form>
      ) : null}
    </DashboardShell>
  );
}
