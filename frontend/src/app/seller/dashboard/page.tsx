"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { fetchSellerProducts, listFromPaginated } from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";
import { Product } from "@/lib/types";

const links = [
  { href: "/seller/dashboard", label: "Dashboard" },
  { href: "/seller/products", label: "Inventory" },
  { href: "/seller/orders", label: "Orders" },
  { href: "/seller/products/new", label: "Add Product" },
  { href: "/seller/account", label: "Account" },
];

export default function SellerDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredAuth().token;
    if (!token) {
      setLoadError("Please login as seller to load dashboard analytics.");
      setLoading(false);
      return;
    }

    fetchSellerProducts(token)
      .then((data) => {
        setProducts(listFromPaginated<Product>(data));
        setLoadError("");
      })
      .catch((error) =>
        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load seller dashboard data.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter((item) => item.is_active !== false).length;
    const totalStock = products.reduce((sum, item) => sum + (item.stock ?? 0), 0);
    const estimatedValue = products.reduce(
      (sum, item) => sum + Number(item.price ?? 0) * Number(item.stock ?? 0),
      0,
    );

    return { totalProducts, activeProducts, totalStock, estimatedValue };
  }, [products]);

  const recentProducts = useMemo(() => {
    return [...products].slice(0, 5);
  }, [products]);

  const topProductsByValue = useMemo(() => {
    return [...products]
      .sort((a, b) => Number(b.price) - Number(a.price))
      .slice(0, 5);
  }, [products]);

  return (
    <DashboardShell
      title="Store Overview"
      subtitle="Welcome back, your store performance is up by 12% this week."
      links={links}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Estimated Inventory Value", `$${stats.estimatedValue.toFixed(2)}`],
          ["Total Stock Units", String(stats.totalStock)],
          ["Products", String(stats.totalProducts)],
          ["Active Listings", String(stats.activeProducts)],
        ].map(([title, value]) => (
          <article key={title} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-slate-500">{title}</p>
            <p className="mt-2 text-4xl font-bold">{value}</p>
          </article>
        ))}
      </div>
      {loading ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-slate-600">
          Loading dashboard data...
        </div>
      ) : loadError ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {loadError}
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-3xl font-semibold">Recent Products</h2>
            {recentProducts.length === 0 ? (
              <p className="mt-4 text-slate-600">No products available yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {recentProducts.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between border-b border-slate-100 pb-2"
                  >
                    <p>{item.name}</p>
                    <p className="font-semibold">${Number(item.price).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-3xl font-semibold">Top Value Products</h2>
            {topProductsByValue.length === 0 ? (
              <p className="mt-4 text-slate-600">No products to rank yet.</p>
            ) : (
              <div className="mt-4 space-y-3 text-sm">
                {topProductsByValue.map((item) => (
                  <p key={item.id}>
                    {item.name} - ${Number(item.price).toFixed(2)}
                  </p>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </DashboardShell>
  );
}
