"use client";

import { useEffect, useState } from "react";
import { StoreFooter } from "@/components/store-footer";
import { StoreHeader } from "@/components/store-header";
import { fetchDeliveryOrders, listFromPaginated } from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";
import { Order } from "@/lib/types";

const fallback: Order[] = [
  { id: 8821, status: "assigned", total_amount: 0, customer: { name: "Eleanor Shellstrop" } },
  { id: 9012, status: "assigned", total_amount: 0, customer: { name: "Chidi Anagonye" } },
];

export default function DeliveryOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(fallback);

  useEffect(() => {
    const token = getStoredAuth().token;
    if (!token) return;

    fetchDeliveryOrders(token)
      .then((data) => {
        const rows = listFromPaginated<Order>(data);
        if (rows.length > 0) {
          setOrders(rows);
        }
      })
      .catch(() => setOrders(fallback));
  }, []);

  return (
    <div>
      <StoreHeader />
      <main className="mx-auto min-h-[70vh] max-w-[1280px] px-6 py-6">
        <h1 className="text-6xl font-bold">Assigned Orders</h1>
        <p className="mt-2 text-slate-600">Your active deliveries for today.</p>
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5">
              <div>
                <p className="font-bold text-brand-600">#ORD-{order.id}</p>
                <p className="text-3xl font-semibold">{order.customer?.name ?? "Customer"}</p>
                <p className="text-slate-600">Assigned delivery address</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <button className="rounded-lg bg-brand-100 px-3 py-2">Out for Delivery</button>
                <button className="rounded-lg bg-brand-100 px-3 py-2">Arrived</button>
                <button className="rounded-lg bg-brand-600 px-3 py-2 text-white">Delivered</button>
              </div>
            </article>
          ))}
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
