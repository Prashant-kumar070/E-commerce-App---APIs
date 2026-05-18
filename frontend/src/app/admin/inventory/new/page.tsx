"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ADMIN_SHELL_LINKS } from "@/lib/admin-links";
import { createAdminProduct, fetchAdminUsersPaged } from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";
import { User } from "@/lib/types";

export default function AdminInventoryNewPage() {
  const router = useRouter();
  const [sellers, setSellers] = useState<User[]>([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    seller_id: "",
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
    void fetchAdminUsersPaged(token, { role: "seller", per_page: 100 }).then(({ items }) => setSellers(items));
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = getStoredAuth().token;
    if (!token) return;
    if (!form.seller_id) {
      setMessage("Select a seller.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      const fd = new FormData();
      fd.append("seller_id", form.seller_id);
      fd.append("name", form.name);
      if (form.description) fd.append("description", form.description);
      fd.append("price", form.price);
      fd.append("stock", form.stock);
      fd.append("is_active", form.is_active ? "1" : "0");
      if (image) fd.append("image", image);
      await createAdminProduct(token, fd);
      router.push("/admin/inventory");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not create product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell title="Add product" subtitle="Create a listing on behalf of any seller." links={ADMIN_SHELL_LINKS}>
      <form onSubmit={onSubmit} className="max-w-lg space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        {message ? <p className="text-sm text-red-600">{message}</p> : null}
        <div>
          <label className="text-sm font-medium text-slate-700">Seller</label>
          <select
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            value={form.seller_id}
            onChange={(e) => setForm((f) => ({ ...f, seller_id: e.target.value }))}
          >
            <option value="">Select seller…</option>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
        </div>
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
          Active (visible in catalog when stock allows)
        </label>
        <div>
          <label className="text-sm font-medium text-slate-700">Image (optional)</label>
          <input type="file" accept="image/*" className="mt-1 w-full text-sm" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white">
            {submitting ? "Saving…" : "Create product"}
          </button>
          <Link href="/admin/inventory" className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700">
            Cancel
          </Link>
        </div>
      </form>
    </DashboardShell>
  );
}
