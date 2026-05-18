"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ADMIN_SHELL_LINKS } from "@/lib/admin-links";
import { fetchAdminOrdersPaged } from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";
import { Order, PaginationInfo } from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "assigned", label: "Assigned" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function formatStatus(s: string) {
  return s.split("_").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(
    async (page: number) => {
      const token = getStoredAuth().token;
      if (!token) {
        setMessage("Please log in as admin.");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { items, pagination: p } = await fetchAdminOrdersPaged(token, {
          page,
          per_page: 15,
          ...(status ? { status } : {}),
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
        });
        setOrders(items);
        setPagination(p);
        setMessage("");
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    },
    [status, debouncedSearch],
  );

  useEffect(() => {
    void load(1);
  }, [load]);

  return (
    <DashboardShell title="Orders" subtitle="Search, filter by status, create orders for a customer." links={ADMIN_SHELL_LINKS}>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[200px] flex-1">
          <label className="block text-xs font-semibold uppercase text-slate-500">Search</label>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Order # or customer name / email"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </div>
        <Link
          href="/admin/orders/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Create order
        </Link>
      </div>

      {message ? <p className="mb-3 text-sm text-amber-800">{message}</p> : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <p className="p-6 text-slate-600">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="p-6 text-slate-600">No orders match your filters.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#dce9ff] text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold text-brand-600">#{order.order_number ?? order.id}</td>
                  <td className="px-4 py-3">{order.customer?.name ?? "—"}</td>
                  <td className="px-4 py-3">${Number(order.total_amount).toFixed(2)}</td>
                  <td className="px-4 py-3">{formatStatus(order.status)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="mr-3 text-brand-600">
                      View
                    </Link>
                    <Link href={`/admin/orders/${order.id}/edit`} className="text-brand-600">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination.last_page > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-600">
            Page {pagination.current_page} of {pagination.last_page} ({pagination.total} orders)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagination.current_page <= 1}
              onClick={() => void load(pagination.current_page - 1)}
              className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => void load(pagination.current_page + 1)}
              className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}
