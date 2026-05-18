"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ADMIN_SHELL_LINKS } from "@/lib/admin-links";
import { deleteAdminUser, fetchAdminUsersPaged } from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";
import { PaginationInfo, User } from "@/lib/types";

const ROLE_FILTER = [
  { value: "", label: "All roles" },
  { value: "customer", label: "Customers only" },
  { value: "seller", label: "Sellers only" },
  { value: "delivery_person", label: "Delivery" },
  { value: "admin", label: "Admins" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });
  const [role, setRole] = useState("");
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
        const { items, pagination: p } = await fetchAdminUsersPaged(token, {
          page,
          per_page: 15,
          ...(role ? { role } : {}),
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
        });
        setUsers(items);
        setPagination(p);
        setMessage("");
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Failed to load users.");
      } finally {
        setLoading(false);
      }
    },
    [role, debouncedSearch],
  );

  useEffect(() => {
    void load(1);
  }, [load]);

  const onDelete = async (user: User) => {
    if (!window.confirm(`Delete user ${user.name} (${user.email})?`)) return;
    const token = getStoredAuth().token;
    if (!token) return;
    try {
      await deleteAdminUser(token, user.id);
      setMessage("User deleted.");
      await load(pagination.current_page);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Delete failed.");
    }
  };

  return (
    <DashboardShell title="User management" subtitle="Search, filter by role, add and edit accounts." links={ADMIN_SHELL_LINKS}>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            {ROLE_FILTER.map((o) => (
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
            placeholder="Name or email"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </div>
        <Link
          href="/admin/users/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Add user
        </Link>
      </div>

      {message ? <p className="mb-3 text-sm text-slate-700">{message}</p> : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <p className="p-6 text-slate-600">Loading…</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-slate-600">No users match your filters.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#dce9ff] text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3 capitalize">{String(user.role).replace(/_/g, " ")}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${user.id}/edit`} className="mr-3 text-brand-600">
                      Edit
                    </Link>
                    <button type="button" onClick={() => void onDelete(user)} className="text-red-600">
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
            Page {pagination.current_page} of {pagination.last_page} ({pagination.total} users)
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
