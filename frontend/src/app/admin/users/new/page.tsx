"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ADMIN_SHELL_LINKS } from "@/lib/admin-links";
import { createAdminUser } from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";

const ROLES = ["customer", "seller", "delivery_person", "admin"] as const;

export default function AdminUserNewPage() {
  const router = useRouter();
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

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = getStoredAuth().token;
    if (!token) {
      setMessage("Please log in as admin.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      await createAdminUser(token, {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        address: form.address || undefined,
        role: form.role,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      router.push("/admin/users");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not create user.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell title="Add user" subtitle="Create an account for any role." links={ADMIN_SHELL_LINKS}>
      <form onSubmit={onSubmit} className="max-w-lg space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        {message ? <p className="text-sm text-red-600">{message}</p> : null}
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
        <div>
          <label className="text-sm font-medium text-slate-700">Password</label>
          <input
            required
            type="password"
            minLength={8}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Confirm password</label>
          <input
            required
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
            {submitting ? "Saving…" : "Create user"}
          </button>
          <Link href="/admin/users" className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700">
            Cancel
          </Link>
        </div>
      </form>
    </DashboardShell>
  );
}
