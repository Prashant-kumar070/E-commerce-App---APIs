"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StoreFooter } from "@/components/store-footer";
import { StoreHeader } from "@/components/store-header";
import { fetchCustomerCart, placeCustomerOrder } from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";
import type { CartLineItem, CustomerCart } from "@/lib/types";
import { getProductImageUrl } from "@/lib/product-images";

function lineTotal(item: CartLineItem): number {
  return Number(item.subtotal);
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CustomerCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const loadCart = useCallback(async () => {
    const { token, user } = getStoredAuth();
    if (!token || user?.role !== "customer") {
      setCart(null);
      setLoading(false);
      return;
    }
    setLoading(true);
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

  const { token, user } = getStoredAuth();
  const isCustomer = Boolean(token && user?.role === "customer");
  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + lineTotal(item), 0);
  const apiTotal = cart?.total_amount != null ? Number(cart.total_amount) : subtotal;
  const total = Number.isFinite(apiTotal) ? apiTotal : subtotal;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || user?.role !== "customer") return;
    if (items.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setMessage("");
    try {
      const order = await placeCustomerOrder(token, {
        recipient_name: String(form.get("recipient_name")),
        recipient_phone: String(form.get("recipient_phone")),
        shipping_address: String(form.get("shipping_address")),
        shipping_city: String(form.get("shipping_city")),
        shipping_state: String(form.get("shipping_state")),
        shipping_postal_code: String(form.get("shipping_postal_code")),
        shipping_country: String(form.get("shipping_country")),
        notes: String(form.get("notes") ?? "") || undefined,
      });
      router.push(`/orders/${order.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Order could not be placed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <StoreHeader />
      <main className="mx-auto max-w-[1280px] px-6 py-6">
        <h1 className="text-5xl font-bold">Checkout</h1>

        {!isCustomer ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
            <p>Log in as a customer to checkout.</p>
            <Link href="/login" className="mt-3 inline-block font-semibold text-brand-600">
              Go to login
            </Link>
          </div>
        ) : loading ? (
          <p className="mt-6 text-slate-600">Loading checkout…</p>
        ) : items.length === 0 ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
            <p>Your cart is empty — add products before checkout.</p>
            <Link href="/" className="mt-3 inline-block font-semibold text-brand-600">
              Continue shopping
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <section className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-3xl font-semibold">Shipping</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input
                    name="recipient_name"
                    required
                    placeholder="Recipient full name"
                    className="rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <input
                    name="recipient_phone"
                    required
                    placeholder="Phone"
                    className="rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <input
                    name="shipping_address"
                    required
                    placeholder="Street address"
                    className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <input
                    name="shipping_city"
                    required
                    placeholder="City"
                    className="rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <input
                    name="shipping_state"
                    required
                    placeholder="State / region"
                    className="rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <input
                    name="shipping_postal_code"
                    required
                    placeholder="Postal code"
                    className="rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <input
                    name="shipping_country"
                    required
                    placeholder="Country"
                    className="rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <textarea
                    name="notes"
                    placeholder="Delivery notes (optional)"
                    className="sm:col-span-2 min-h-[80px] rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-3xl font-semibold">Review items</h2>
                <ul className="mt-4 space-y-3">
                  {items.map((item) => {
                    const img = getProductImageUrl(item.product);
                    return (
                      <li
                        key={item.id}
                        className="flex gap-3 border-b border-slate-100 pb-3 last:border-0"
                      >
                        {img ? (
                          <img
                            src={img}
                            alt={item.product.name}
                            className="h-16 w-16 rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-500">
                            —
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-slate-500">
                            Qty {item.quantity} × ${Number(item.unit_price).toFixed(2)}
                          </p>
                        </div>
                        <p className="font-semibold text-brand-600">
                          ${lineTotal(item).toFixed(2)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>

            <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-3xl font-semibold">Order summary</h2>
              {message ? (
                <p className="mt-3 text-sm text-red-600">{message}</p>
              ) : null}
              <div className="mt-4 space-y-2 text-slate-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-emerald-700">FREE</span>
                </div>
                <div className="mt-3 border-t border-slate-200 pt-3 text-xl font-bold">
                  <div className="flex justify-between text-brand-600">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full rounded-lg bg-brand-600 py-3 font-semibold text-white disabled:opacity-60"
              >
                {submitting ? "Placing order…" : "Place your order"}
              </button>
            </aside>
          </form>
        )}
      </main>
      <StoreFooter />
    </div>
  );
}
