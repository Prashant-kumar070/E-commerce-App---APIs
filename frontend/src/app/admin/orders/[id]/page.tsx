"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ADMIN_SHELL_LINKS } from "@/lib/admin-links";
import { fetchAdminOrderById } from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";
import { Order } from "@/lib/types";

type Props = { params: { id: string } };

function formatStatus(s: string) {
  return s.split("_").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

export default function AdminOrderDetailsPage({ params }: Props) {
  const [order, setOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = getStoredAuth().token;
    if (!token) {
      setMessage("Please log in as admin.");
      return;
    }
    fetchAdminOrderById(token, params.id)
      .then(setOrder)
      .catch((e) => setMessage(e instanceof Error ? e.message : "Failed to load order."));
  }, [params.id]);

  return (
    <DashboardShell
      title={order ? `Order #${order.order_number ?? order.id}` : "Order"}
      subtitle="Details tied to the customer account"
      links={ADMIN_SHELL_LINKS}
    >
      {message ? <p className="mb-4 text-red-600">{message}</p> : null}
      {!order && !message ? <p className="text-slate-600">Loading…</p> : null}

      {order ? (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <Link href={`/admin/orders/${order.id}/edit`} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
              Edit order
            </Link>
            <Link
              href={`/admin/orders/${order.id}/assign`}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800"
            >
              Assign delivery
            </Link>
            <Link href="/admin/orders" className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700">
              Back to list
            </Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-xl font-semibold">Line items</h2>
              <div className="mt-4 space-y-3">
                {(order.items ?? []).length === 0 ? (
                  <p className="text-slate-600">No items on this order.</p>
                ) : (
                  (order.items ?? []).map((item) => {
                    const unit = Number(item.unit_price ?? item.price ?? 0);
                    const sub = item.subtotal != null ? Number(item.subtotal) : unit * item.quantity;
                    return (
                      <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <p className="font-medium">{item.product_name ?? item.product?.name ?? `Product #${item.product_id}`}</p>
                          <p className="text-sm text-slate-500">
                            Qty {item.quantity} × ${unit.toFixed(2)}
                          </p>
                          {item.product?.seller?.name ? (
                            <p className="text-xs text-slate-500">Seller: {item.product.seller.name}</p>
                          ) : null}
                        </div>
                        <p className="font-semibold">${sub.toFixed(2)}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
            <aside className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-lg font-semibold">Customer</h3>
                <p className="mt-2 font-medium">{order.customer?.name ?? "—"}</p>
                <p className="text-sm text-slate-600">{order.customer?.email ?? ""}</p>
                <p className="mt-2 text-sm text-slate-500">Status: {formatStatus(order.status)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-lg font-semibold">Shipping</h3>
                <p className="mt-2 text-sm">{order.recipient_name}</p>
                <p className="text-sm text-slate-600">{order.recipient_phone}</p>
                <p className="mt-2 text-sm text-slate-700">
                  {[order.shipping_address, order.shipping_city, order.shipping_state, order.shipping_postal_code, order.shipping_country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {order.notes ? <p className="mt-2 text-sm text-slate-600">Notes: {order.notes}</p> : null}
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-lg font-semibold">Total</h3>
                <p className="mt-2 text-2xl font-bold">${Number(order.total_amount).toFixed(2)}</p>
              </div>
            </aside>
          </div>
        </>
      ) : null}
    </DashboardShell>
  );
}
