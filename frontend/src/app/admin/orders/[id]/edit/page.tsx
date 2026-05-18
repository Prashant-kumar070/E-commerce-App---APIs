"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ADMIN_SHELL_LINKS } from "@/lib/admin-links";
import { fetchAdminOrderById, patchAdminOrderStatus, updateAdminOrder } from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";
import { Order } from "@/lib/types";

const STATUSES = ["pending", "processing", "assigned", "out_for_delivery", "delivered", "cancelled"] as const;

type Props = { params: { id: string } };

export default function AdminOrderEditPage({ params }: Props) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = getStoredAuth().token;
    if (!token) return;
    fetchAdminOrderById(token, params.id)
      .then((o) => {
        setOrder(o);
        setStatus(o.status);
        setShipping({
          recipient_name: o.recipient_name ?? "",
          recipient_phone: o.recipient_phone ?? "",
          shipping_address: o.shipping_address ?? "",
          shipping_city: o.shipping_city ?? "",
          shipping_state: o.shipping_state ?? "",
          shipping_postal_code: o.shipping_postal_code ?? "",
          shipping_country: o.shipping_country ?? "",
          notes: o.notes ?? "",
        });
      })
      .catch((e) => setMessage(e instanceof Error ? e.message : "Failed to load order."));
  }, [params.id]);

  const saveShipping = async (e: FormEvent) => {
    e.preventDefault();
    const token = getStoredAuth().token;
    if (!token) return;
    setSaving(true);
    setMessage("");
    try {
      await updateAdminOrder(token, params.id, shipping);
      router.push(`/admin/orders/${params.id}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const saveStatus = async () => {
    const token = getStoredAuth().token;
    if (!token || !order) return;
    setSaving(true);
    setMessage("");
    try {
      await patchAdminOrderStatus(token, params.id, status);
      router.push(`/admin/orders/${params.id}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Status update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell title="Edit order" subtitle={order ? `#${order.order_number ?? order.id}` : "…"} links={ADMIN_SHELL_LINKS}>
      {!order && !message ? <p className="text-slate-600">Loading…</p> : null}
      {message ? <p className="mb-4 text-sm text-red-600">{message}</p> : null}

      {order ? (
        <div className="max-w-xl space-y-8">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Fulfillment status</h2>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">Status</label>
                <select
                  className="mt-1 block rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                disabled={saving || status === order.status}
                onClick={() => void saveStatus()}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                Update status
              </button>
            </div>
          </section>

          <form onSubmit={saveShipping} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Shipping & notes</h2>
            <div>
              <label className="text-xs font-semibold text-slate-500">Recipient name</label>
              <input
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={shipping.recipient_name}
                onChange={(e) => setShipping((s) => ({ ...s, recipient_name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Recipient phone</label>
              <input
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={shipping.recipient_phone}
                onChange={(e) => setShipping((s) => ({ ...s, recipient_phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Address</label>
              <input
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={shipping.shipping_address}
                onChange={(e) => setShipping((s) => ({ ...s, shipping_address: e.target.value }))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
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
                <label className="text-xs font-semibold text-slate-500">State</label>
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
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Notes</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                rows={2}
                value={shipping.notes}
                onChange={(e) => setShipping((s) => ({ ...s, notes: e.target.value }))}
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white">
                {saving ? "Saving…" : "Save shipping"}
              </button>
              <Link href={`/admin/orders/${params.id}`} className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      ) : null}
    </DashboardShell>
  );
}
