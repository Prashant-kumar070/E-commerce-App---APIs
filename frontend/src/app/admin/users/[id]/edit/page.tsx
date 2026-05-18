"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ADMIN_SHELL_LINKS } from "@/lib/admin-links";
import { fetchAdminUserById, updateAdminUser } from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";
import { User } from "@/lib/types";

const ROLES = ["customer", "seller", "delivery_person", "admin"] as const;

type Props = { params: { id: string } };

export default function AdminUserEditPage({ params }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "customer",
    password: "",
    password_confirmation: "",
  });

  useEffect(() => {
    const token = getStoredAuth().token;
    if (!token) {
      setMessage("Please log in as admin.");
      return;
    }
    fetchAdminUserById(token, params.id)
      .then((u) => {
        setUser(u);
        setForm((f) => ({
          ...f,
          name: u.name,
          email: u.email,
          phone: u.phone ?? "",
          address: u.address ?? "",
          role: u.role,
        }));
      })
      .catch((e) => setMessage(e instanceof Error ? e.message : "Failed to load user."));
  }, [params.id]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = getStoredAuth().token;
    if (!token) return;
    setSubmitting(true);
    setMessage("");
    try {
      const body: Parameters<typeof updateAdminUser>[2] = {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        address: form.address || undefined,
        role: form.role,
      };
      if (form.password) {
        body.password = form.password;
        body.password_confirmation = form.password_confirmation;
      }
      await updateAdminUser(token, params.id, body);
      router.push("/admin/users");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell title="Edit user" subtitle={user ? user.email : "…"} links={ADMIN_SHELL_LINKS}>
      {!user && !message ? (
        <p className="text-slate-600">Loading…</p>
      ) : message && !user ? (
        <p className="text-red-600">{message}</p>
      ) : (
        <form onSubmit={onSubmit} className="max-w-lg space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          {message && user ? <p className="text-sm text-red-600">{message}</p> : null}
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
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              required
              type="email"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Phone</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Address</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              rows={2}
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Role</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-500">Leave password blank to keep the current password.</p>
          <div>
            <label className="text-sm font-medium text-slate-700">New password</label>
            <input
              type="password"
              minLength={8}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Confirm new password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form.password_confirmation}
              onChange={(e) => setForm((f) => ({ ...f, password_confirmation: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save changes"}
            </button>
            <Link href="/admin/users" className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700">
              Cancel
            </Link>
          </div>
        </form>
      )}
    </DashboardShell>
  );
}
