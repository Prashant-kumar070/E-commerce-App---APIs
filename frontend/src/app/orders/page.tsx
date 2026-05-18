"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StoreFooter } from "@/components/store-footer";
import { StoreHeader } from "@/components/store-header";
import { fetchCustomerOrders, listFromPaginated } from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";
import { Order } from "@/lib/types";

const fallbackOrders: Order[] = [
  { id: 99281, order_number: "ORD-99281-XC", status: "shipped", total_amount: 129 },
  { id: 88120, order_number: "ORD-88120-LM", status: "delivered", total_amount: 345.5 },
  { id: 99300, order_number: "ORD-99300-AA", status: "processing", total_amount: 599 },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(fallbackOrders);

  useEffect(() => {
    const token = getStoredAuth().token;
    if (!token) return;

    fetchCustomerOrders(token)
      .then((data) => {
        const rows = listFromPaginated<Order>(data);
        if (rows.length > 0) {
          setOrders(rows);
        }
      })
      .catch(() => setOrders(fallbackOrders));
  }, []);

  return (
    <div>
      <StoreHeader />
      <main className="mx-auto min-h-[70vh] max-w-[1280px] px-6 py-6">
        <h1 className="text-6xl font-bold">My Orders</h1>
        <p className="mt-2 text-slate-600">Manage your purchases and track shipments.</p>
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5">
              <div>
                <p className="text-lg font-bold text-brand-600">
                  #{order.order_number ?? `ORD-${order.id}`}
                </p>
                <h2 className="text-3xl font-semibold">
                  {order.items?.[0]?.product?.name ?? "Order Item"}
                </h2>
                <span className="mt-1 inline-block rounded-full bg-[#56fbab]/40 px-3 py-1 text-sm text-[#007146]">
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">${Number(order.total_amount).toFixed(2)}</p>
                <Link
                  href={`/orders/${order.id}`}
                  className="mt-3 inline-block rounded-lg bg-brand-600 px-5 py-2 font-semibold text-white"
                >
                  Track Order
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
