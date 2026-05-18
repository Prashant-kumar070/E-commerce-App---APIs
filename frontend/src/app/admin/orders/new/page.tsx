"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ADMIN_SHELL_LINKS } from "@/lib/admin-links";
import { createAdminOrder, fetchAdminProductsPaged, fetchAdminUsersPaged } from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";
import { Product, User } from "@/lib/types";

type Line = { product_id: number; quantity: number; label: string };

export default function AdminOrderNewPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerLabel, setCustomerLabel] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerHits, setCustomerHits] = useState<User[]>([]);

  const [productSearch, setProductSearch] = useState("");
  const [productHits, setProductHits] = useState<Product[]>([]);

  const [lines, setLines] = useState<Line[]>([]);

  const [shipping, setShipping] = useState({
    recipient_name: "",
    recipient_phone: "",
    shipping_address: "",
    shipping_city: "",
    shipping_state: "",
    shipping_postal_code: "",
    shipping_country: "",
    notes: "",
  });

  useEffect(() => {
    const token = getStoredAuth().token;
    if (!token) return;
    const t = setTimeout(() => {
      void fetchAdminUsersPaged(token, { role: "customer", search: customerSearch.trim() || undefined, per_page: 20 }).then(
        ({ items }) => setCustomerHits(items),
      );
    }, 300);
    return () => clearTimeout(t);
  }, [customerSearch]);

  useEffect(() => {
    const token = getStoredAuth().token;
    if (!token) return;
    const t = setTimeout(() => {
      void fetchAdminProductsPaged(token, { search: productSearch.trim() || undefined, per_page: 20 }).then(({ items }) =>
        setProductHits(items),
      );
    }, 300);
    return () => clearTimeout(t);
  }, [productSearch]);

  const pickCustomer = (u: User) => {
    setCustomerId(u.id);
    setCustomerLabel(`${u.name} <${u.email}>`);
    setCustomerHits([]);
    setCustomerSearch("");
    setShipping((s) => ({
      ...s,
      recipient_name: s.recipient_name || u.name,
    }));
  };

  const addProductLine = (p: Product) => {
    if (lines.some((l) => l.product_id === p.id)) {
      setLines((prev) => prev.map((l) => (l.product_id === p.id ? { ...l, quantity: l.quantity + 1 } : l)));
    } else {
      setLines((prev) => [...prev, { product_id: p.id, quantity: 1, label: p.name }]);
    }
    setProductHits([]);
    setProductSearch("");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setMessage("Select which customer this order belongs to.");
      return;
    }
    if (lines.length === 0) {
      setMessage("Add at least one product line.");
      return;
    }
    const token = getStoredAuth().token;
    if (!token) return;
    setSubmitting(true);
    setMessage("");
    try {
      await createAdminOrder(token, {
        customer_id: customerId,
        items: lines.map(({ product_id, quantity }) => ({ product_id, quantity })),
        ...shipping,
      });
      router.push("/admin/orders");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not create order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell title="Create order" subtitle="Choose a customer account and line items. Stock is deducted immediately." links={ADMIN_SHELL_LINKS}>
      <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
        {message ? <p className="text-sm text-red-600">{message}</p> : null}

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Customer</h2>
          <p className="mt-1 text-sm text-slate-600">The order is stored on this customer&apos;s account.</p>
          {customerId ? (
            <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              Selected: {customerLabel}{" "}
              <button type="button" className="ml-2 text-brand-600 underline" onClick={() => setCustomerId(null)}>
                Change
              </button>
            </p>
          ) : (
            <div className="relative mt-3">
              <input
                type="search"
                placeholder="Search customers by name or email"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              {customerHits.length > 0 ? (
                <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow">
                  {customerHits.map((u) => (
                    <li key={u.id}>
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                        onClick={() => pickCustomer(u)}
                      >
                        {u.name} — {u.email}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Products</h2>
          <div className="relative mt-3">
            <input
              type="search"
              placeholder="Search catalog to add a product"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            {productHits.length > 0 ? (
              <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow">
                {productHits.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                      onClick={() => addProductLine(p)}
                    >
                      {p.name} — ${Number(p.price).toFixed(2)} (stock {p.stock})
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          {lines.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No line items yet.</p>
          ) : (
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2">Product</th>
                  <th className="py-2">Qty</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.product_id} className="border-t border-slate-100">
                    <td className="py-2">{line.label}</td>
                    <td className="py-2">
                      <input
                        type="number"
                        min={1}
                        className="w-20 rounded border border-slate-200 px-2 py-1"
                        value={line.quantity}
                        onChange={(e) => {
                          const q = Math.max(1, parseInt(e.target.value, 10) || 1);
                          setLines((prev) => prev.map((l) => (l.product_id === line.product_id ? { ...l, quantity: q } : l)));
                        }}
                      />
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        className="text-red-600"
                        onClick={() => setLines((prev) => prev.filter((l) => l.product_id !== line.product_id))}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Shipping</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500">Recipient name</label>
              <input
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={shipping.recipient_name}
                onChange={(e) => setShipping((s) => ({ ...s, recipient_name: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500">Recipient phone</label>
              <input
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={shipping.recipient_phone}
                onChange={(e) => setShipping((s) => ({ ...s, recipient_phone: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500">Address</label>
              <input
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={shipping.shipping_address}
                onChange={(e) => setShipping((s) => ({ ...s, shipping_address: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">City</label>
              <input
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={shipping.shipping_city}
                onChange={(e) => setShipping((s) => ({ ...s, shipping_city: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">State / region</label>
              <input
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={shipping.shipping_state}
                onChange={(e) => setShipping((s) => ({ ...s, shipping_state: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Postal code</label>
              <input
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={shipping.shipping_postal_code}
                onChange={(e) => setShipping((s) => ({ ...s, shipping_postal_code: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Country</label>
              <input
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={shipping.shipping_country}
                onChange={(e) => setShipping((s) => ({ ...s, shipping_country: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500">Notes (optional)</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                rows={2}
                value={shipping.notes}
                onChange={(e) => setShipping((s) => ({ ...s, notes: e.target.value }))}
              />
            </div>
          </div>
        </section>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create order"}
          </button>
          <Link href="/admin/orders" className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700">
            Cancel
          </Link>
        </div>
      </form>
    </DashboardShell>
  );
}
