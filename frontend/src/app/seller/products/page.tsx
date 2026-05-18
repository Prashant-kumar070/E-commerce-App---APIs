"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  deleteSellerProduct,
  fetchSellerProducts,
  listFromPaginated,
} from "@/lib/api";
import { getStoredAuth } from "@/lib/auth";
import { Product } from "@/lib/types";

const links = [
  { href: "/seller/dashboard", label: "Dashboard" },
  { href: "/seller/products", label: "Inventory" },
  { href: "/seller/orders", label: "Orders" },
  { href: "/seller/products/new", label: "Add Product" },
  { href: "/seller/account", label: "Account" },
];

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [actionMessage, setActionMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [requiresLogin, setRequiresLogin] = useState(false);

  useEffect(() => {
    const token = getStoredAuth().token;
    if (!token) {
      setRequiresLogin(true);
      setLoading(false);
      return;
    }

    fetchSellerProducts(token)
      .then((data) => {
        const rows = listFromPaginated<Product>(data);
        setProducts(rows);
      })
      .catch((error) =>
        setActionMessage(
          error instanceof Error
            ? error.message
            : "Unable to fetch seller products from API.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const onDelete = async (productId: number) => {
    const token = getStoredAuth().token;
    if (!token) {
      setActionMessage("Please login as seller to delete products.");
      return;
    }

    try {
      await deleteSellerProduct(token, productId);
      setProducts((prev) => prev.filter((item) => item.id !== productId));
      setActionMessage("Product deleted successfully.");
    } catch (error) {
      setActionMessage(
        error instanceof Error ? error.message : "Unable to delete product.",
      );
    }
  };

  return (
    <DashboardShell
      title="Product Inventory"
      subtitle="Manage your storefront products and stock levels."
      links={links}
    >
      <div className="mb-4 flex justify-end">
        <Link href="/seller/products/new" className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white">
          Add Product
        </Link>
      </div>
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
          Loading seller products...
        </div>
      ) : requiresLogin ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
          Please login as a seller to view your real product inventory.
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
          No seller products found yet. Create your first product.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left">
            <thead className="bg-[#dce9ff] text-sm uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3">{product.category ?? "General"}</td>
                  <td className="px-4 py-3">${product.price}</td>
                  <td className="px-4 py-3">{product.stock} units</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[#56fbab]/40 px-3 py-1 text-sm text-[#007146]">
                      {product.is_active === false ? "Draft" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 text-sm">
                      <Link
                        href={`/seller/products/${product.id}/edit`}
                        className="font-medium text-brand-600"
                      >
                        Edit
                      </Link>
                      <button
                        className="font-medium text-red-600"
                        onClick={() => onDelete(product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {actionMessage ? (
        <p className="mt-3 text-sm text-slate-600">{actionMessage}</p>
      ) : null}
    </DashboardShell>
  );
}
