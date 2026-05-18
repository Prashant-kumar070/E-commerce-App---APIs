"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { StoreFooter } from "@/components/store-footer";
import { StoreHeader } from "@/components/store-header";
import {
  fetchCustomerCart,
  removeCustomerCartItem,
  updateCustomerCartItem,
} from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";
import type { CartLineItem, CustomerCart } from "@/lib/types";
import { getProductImageUrl } from "@/lib/product-images";

function lineTotal(item: CartLineItem): number {
  return Number(item.subtotal);
}

export default function CartPage() {
  const [cart, setCart] = useState<CustomerCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);

  const loadCart = useCallback(async () => {
    const { token, user } = getStoredAuth();
    if (!token || user?.role !== "customer") {
      setCart(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const data = await fetchCustomerCart(token);
      setCart(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load cart.");
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  const onUpdateQty = async (item: CartLineItem, nextQty: number) => {
    const token = getStoredAuth().token;
    if (!token || nextQty < 1) return;
    setPendingId(item.id);
    setMessage("");
    try {
      const updated = await updateCustomerCartItem(token, item.id, { quantity: nextQty });
      setCart(updated);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Update failed.");
    } finally {
      setPendingId(null);
    }
  };

  const onRemove = async (itemId: number) => {
    const token = getStoredAuth().token;
    if (!token) return;
    setPendingId(itemId);
    setMessage("");
    try {
      const updated = await removeCustomerCartItem(token, itemId);
      setCart(updated);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Remove failed.");
    } finally {
      setPendingId(null);
    }
  };

  const { token, user } = getStoredAuth();
  const isCustomer = Boolean(token && user?.role === "customer");
  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + lineTotal(item), 0);
  const apiTotal = cart?.total_amount != null ? Number(cart.total_amount) : subtotal;
  const displayTotal = Number.isFinite(apiTotal) ? apiTotal : subtotal;

  return (
    <div>
      <StoreHeader />
      <main className="mx-auto min-h-[70vh] max-w-[1280px] px-6 py-8">
        <h1 className="mb-6 text-3xl font-semibold">Your Cart</h1>

        {!isCustomer ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
            <p>Log in with a customer account to view your cart.</p>
            <Link href="/login" className="mt-3 inline-block font-semibold text-brand-600">
              Go to login
            </Link>
          </div>
        ) : loading ? (
          <p className="text-slate-600">Loading cart…</p>
        ) : message && !cart ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{message}</div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
            <p>Your cart is empty.</p>
            <Link href="/" className="mt-3 inline-block font-semibold text-brand-600">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <section className="space-y-4">
              {message ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  {message}
                </div>
              ) : null}
              {items.map((item) => {
                const img = getProductImageUrl(item.product);
                const busy = pendingId === item.id;
                return (
                  <article
                    key={item.id}
                    className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4"
                  >
                    {img ? (
                      <img
                        src={img}
                        alt={item.product.name}
                        className="h-28 w-28 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500">
                        No image
                      </div>
                    )}
                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div className="min-w-0">
                        <p className="text-xl font-semibold">{item.product.name}</p>
                        <p className="text-slate-500">
                          ${Number(item.unit_price).toFixed(2)} each
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            className="rounded border border-slate-300 px-2 py-1 text-sm disabled:opacity-50"
                            disabled={busy || item.quantity <= 1}
                            onClick={() => onUpdateQty(item, item.quantity - 1)}
                          >
                            −
                          </button>
                          <span className="min-w-[1.5rem] text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="rounded border border-slate-300 px-2 py-1 text-sm disabled:opacity-50"
                            disabled={busy}
                            onClick={() => onUpdateQty(item, item.quantity + 1)}
                          >
                            +
                          </button>
                          <button
                            type="button"
                            className="ml-2 text-sm font-medium text-red-600 disabled:opacity-50"
                            disabled={busy}
                            onClick={() => onRemove(item.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-brand-600">
                        ${lineTotal(item).toFixed(2)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-2xl font-semibold">Order Summary</h2>
              <div className="mt-5 space-y-3 text-slate-700">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} line{items.length === 1 ? "" : "s"})</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="text-emerald-700">FREE</span>
                </div>
                <div className="mt-3 border-t border-slate-200 pt-3 text-lg font-semibold">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span>${displayTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <Link
                href="/checkout"
                className="mt-6 block w-full rounded-lg bg-brand-600 py-3 text-center font-semibold text-white"
              >
                Proceed to Checkout
              </Link>
            </aside>
          </div>
        )}
      </main>
      <StoreFooter />
    </div>
  );
}
