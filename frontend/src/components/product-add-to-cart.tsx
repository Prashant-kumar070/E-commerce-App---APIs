"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addCustomerCartItem } from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";

type ProductAddToCartProps = {
  productId: number;
  disabled?: boolean;
};

export function ProductAddToCart({ productId, disabled }: ProductAddToCartProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const runAdd = async (thenNavigate: "/cart" | "/checkout") => {
    setMessage("");
    const { token, user } = getStoredAuth();
    if (!token || !user) {
      setMessage("Please log in to use your cart.");
      return;
    }
    if (user.role !== "customer") {
      setMessage("Only a customer account can add products to the cart.");
      return;
    }
    if (disabled) return;

    setLoading(true);
    try {
      await addCustomerCartItem(token, { product_id: productId, quantity });
      router.push(thenNavigate);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update cart.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-600">Quantity</span>
        <div className="flex items-center rounded-lg border border-slate-300">
          <button
            type="button"
            className="px-3 py-2 text-lg"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={disabled || loading}
          >
            −
          </button>
          <span className="min-w-[2rem] text-center text-sm font-semibold">{quantity}</span>
          <button
            type="button"
            className="px-3 py-2 text-lg"
            onClick={() => setQuantity((q) => q + 1)}
            disabled={disabled || loading}
          >
            +
          </button>
        </div>
      </div>
      {message ? <p className="text-sm text-red-600">{message}</p> : null}
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => runAdd("/cart")}
        className="block w-full rounded-lg bg-brand-600 py-3 text-center font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Working…" : "Add to Cart"}
      </button>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => runAdd("/checkout")}
        className="block w-full rounded-lg bg-emerald-700 py-3 text-center font-semibold text-white disabled:opacity-50"
      >
        Buy Now
      </button>
      <Link href="/cart" className="block text-center text-sm text-brand-600">
        Go to Cart
      </Link>
    </div>
  );
}
