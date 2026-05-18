"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ADMIN_SHELL_LINKS } from "@/lib/admin-links";
import { fetchAdminStats } from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";
import { AdminStats } from "@/lib/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredAuth().token;
    if (!token) {
      setMessage("Log in as an admin to view dashboard metrics.");
      setLoading(false);
      return;
    }

    fetchAdminStats(token)
      .then(setStats)
      .catch((e) => setMessage(e instanceof Error ? e.message : "Could not load stats."))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        ["Total revenue", `$${stats.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ["Orders", String(stats.orders_count)],
        ["Avg. order value", `$${stats.avg_order_value.toFixed(2)}`],
        ["Users", String(stats.users_count)],
        ["Customers", String(stats.customers_count)],
        ["Sellers", String(stats.sellers_count)],
        ["Products listed", String(stats.products_count)],
      ]
    : [];

  return (
    <DashboardShell
      title="Platform overview"
      subtitle="Live counts and revenue from your database."
      links={ADMIN_SHELL_LINKS}
    >
      {loading ? (
        <p className="text-slate-600">Loading metrics…</p>
      ) : message ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          {message}{" "}
          <Link href="/login" className="font-semibold text-brand-600 underline">
            Login
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(([title, value]) => (
              <article key={title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">{title}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Tip: manage people in User Management, fulfillment in Orders, and catalog-wide stock in Inventory.
          </p>
        </>
      )}
    </DashboardShell>
  );
}
