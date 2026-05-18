"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ADMIN_SHELL_LINKS } from "@/lib/admin-links";
import { fetchAdminOrderById, fetchAdminUsersPaged, patchAdminAssignDelivery } from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";
import { Order, User } from "@/lib/types";

type Props = { params: { id: string } };

export default function AssignDeliveryPage({ params }: Props) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [message, setMessage] = useState("");
  const [assigning, setAssigning] = useState<number | null>(null);

  useEffect(() => {
    const token = getStoredAuth().token;
    if (!token) return;
    void fetchAdminOrderById(token, params.id).then(setOrder);
    void fetchAdminUsersPaged(token, { role: "delivery_person", per_page: 50 }).then(({ items }) => setDrivers(items));
  }, [params.id]);

  const assign = async (deliveryPersonId: number) => {
    const token = getStoredAuth().token;
    if (!token) return;
    setAssigning(deliveryPersonId);
    setMessage("");
    try {
      await patchAdminAssignDelivery(token, params.id, deliveryPersonId);
      router.push(`/admin/orders/${params.id}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Assignment failed.");
    } finally {
      setAssigning(null);
    }
  };

  return (
    <DashboardShell
      title="Assign delivery"
      subtitle={order ? `Order #${order.order_number ?? order.id}` : "Loading…"}
      links={ADMIN_SHELL_LINKS}
    >
      {message ? <p className="mb-4 text-sm text-red-600">{message}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <aside className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-semibold">Order summary</h2>
          {order ? (
            <>
              <p className="mt-2 text-sm text-slate-600">Customer: {order.customer?.name ?? "—"}</p>
              <p className="mt-2 text-lg font-semibold text-brand-600">${Number(order.total_amount).toFixed(2)}</p>
              <p className="mt-2 text-sm text-slate-700">
                {[order.shipping_address, order.shipping_city, order.shipping_state].filter(Boolean).join(", ")}
              </p>
            </>
          ) : (
            <p className="mt-2 text-slate-500">…</p>
          )}
          <Link href={`/admin/orders/${params.id}`} className="mt-4 inline-block text-sm text-brand-600">
            ← Back to order
          </Link>
        </aside>
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-semibold">Delivery partners</h2>
          {drivers.length === 0 ? (
            <p className="mt-4 text-slate-600">No delivery users found. Create users with the delivery role first.</p>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {drivers.map((d) => (
                <article key={d.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="text-lg font-semibold">{d.name}</p>
                  <p className="text-sm text-slate-600">{d.email}</p>
                  <button
                    type="button"
                    disabled={assigning !== null}
                    onClick={() => void assign(d.id)}
                    className="mt-4 w-full rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {assigning === d.id ? "Assigning…" : "Assign"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
