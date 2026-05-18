"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ADMIN_SHELL_LINKS } from "@/lib/admin-links";
import { deleteAdminProduct, fetchAdminProductsPaged, fetchAdminUsersPaged } from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";
import { PaginationInfo, Product, User } from "@/lib/types";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });
  const [sellerId, setSellerId] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredAuth().token;
    if (!token) return;
    void fetchAdminUsersPaged(token, { role: "seller", per_page: 100 }).then(({ items }) => setSellers(items));
  }, []);

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
        const { items, pagination: p } = await fetchAdminProductsPaged(token, {
          page,
          per_page: 15,
          ...(sellerId ? { seller_id: sellerId } : {}),
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
          ...(activeFilter !== "" ? { is_active: activeFilter } : {}),
        });
        setProducts(items);
        setPagination(p);
        setMessage("");
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Failed to load products.");
      } finally {
        setLoading(false);
      }
    },
    [sellerId, debouncedSearch, activeFilter],
  );

  useEffect(() => {
    void load(1);
  }, [load]);

  const onDelete = async (p: Product) => {
    if (!window.confirm(`Delete product “${p.name}”?`)) return;
    const token = getStoredAuth().token;
    if (!token) return;
    try {
      await deleteAdminProduct(token, p.id);
      setMessage("Product deleted.");
      await load(pagination.current_page);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Delete failed.");
    }
  };

  return (
    <DashboardShell
      title="Inventory (all sellers)"
      subtitle="Browse every listing, filter by seller, search, and manage catalog-wide."
      links={ADMIN_SHELL_LINKS}
    >
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500">Seller</label>
          <select
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            className="mt-1 max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">All sellers</option>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500">Visibility</label>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Active + inactive</option>
            <option value="1">Active only</option>
            <option value="0">Inactive only</option>
          </select>
        </div>
        <div className="min-w-[180px] flex-1">
          <label className="block text-xs font-semibold uppercase text-slate-500">Search</label>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Product name or description"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </div>
        <Link href="/admin/inventory/new" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
          Add product
        </Link>
      </div>

      {message ? <p className="mb-3 text-sm text-slate-800">{message}</p> : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <p className="p-6 text-slate-600">Loading…</p>
        ) : products.length === 0 ? (
          <p className="p-6 text-slate-600">No products match your filters.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#dce9ff] text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Seller</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">{p.seller?.name ?? `#${p.seller_id ?? "—"}`}</td>
                  <td className="px-4 py-3">${Number(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">{p.is_active ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/inventory/${p.id}/edit`} className="mr-3 text-brand-600">
                      Edit
                    </Link>
                    <button type="button" className="text-red-600" onClick={() => void onDelete(p)}>
                      Delete
                    </button>
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
            Page {pagination.current_page} of {pagination.last_page} ({pagination.total} products)
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
