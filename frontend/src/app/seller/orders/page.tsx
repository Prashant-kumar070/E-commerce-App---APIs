"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { fetchSellerOrders, listFromPaginated } from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";
import { SellerOrderSummary } from "@/lib/types";

const links = [
  { href: "/seller/dashboard", label: "Dashboard" },
  { href: "/seller/products", label: "Inventory" },
  { href: "/seller/orders", label: "Orders" },
  { href: "/seller/products/new", label: "Add Product" },
  { href: "/seller/account", label: "Account" },
];

function formatStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<SellerOrderSummary[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [requiresLogin, setRequiresLogin] = useState(false);

  useEffect(() => {
    const token = getStoredAuth().token;
    if (!token) {
      setRequiresLogin(true);
      setLoading(false);
      return;
    }

    fetchSellerOrders(token)
      .then((data) => {
        setOrders(listFromPaginated<SellerOrderSummary>(data));
      })
      .catch((error) =>
        setMessage(
          error instanceof Error ? error.message : "Unable to load seller orders from API.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardShell title="Seller Orders" subtitle="Review and fulfill customer orders." links={links}>
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">Loading orders…</div>
      ) : requiresLogin ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          Please{" "}
          <Link href="/login" className="font-semibold text-brand-600 underline">
            log in as a seller
          </Link>{" "}
          to view orders.
        </div>
      ) : (
        <>
          {message ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {message}
            </div>
          ) : null}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {orders.length === 0 ? (
              <p className="p-6 text-slate-600">No orders include your products yet.</p>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-[#dce9ff] text-sm uppercase text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Your total</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-semibold text-brand-600">#{order.order_number}</td>
                      <td className="px-4 py-3">{order.customer?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        {order.placed_at
                          ? new Date(order.placed_at).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3">${Number(order.seller_subtotal).toFixed(2)}</td>
                      <td className="px-4 py-3">{formatStatus(order.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
      <div className="mt-4">
        <Link href="/seller/products/new" className="text-brand-600">
          Create a new product listing
        </Link>
      </div>
    </DashboardShell>
  );
}
