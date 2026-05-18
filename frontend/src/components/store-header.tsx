"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuth, getRoleHomePath, getStoredAuth } from "@/lib/auth";
import { User } from "@/lib/types";

const navItems = [
  { href: "/deals", label: "Deals" },
  { href: "/categories", label: "Categories" },
  { href: "/sell", label: "Sell" },
  { href: "/help", label: "Help" },
  { href: "/orders", label: "Orders" },
];

export function StoreHeader() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getStoredAuth().user);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-xl shadow-sm transition-all duration-300">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400 hover:opacity-90 transition-opacity">
            SwiftMarket
          </Link>
          <nav className="hidden gap-6 text-sm font-semibold text-slate-600 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative transition-colors hover:text-brand-600 ${
                    isActive ? "text-brand-600" : ""
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-1.5 left-0 h-0.5 w-full bg-brand-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-5 text-sm font-semibold text-slate-700">
          <Link 
            href="/cart" 
            className={`transition-colors hover:text-brand-600 ${pathname === "/cart" ? "text-brand-600" : ""}`}
          >
            Cart
          </Link>
          {user ? (
            <div className="flex items-center gap-4 border-l border-slate-200 pl-4">
              <Link href={getRoleHomePath(user.role)} className="text-brand-600 hover:text-brand-700 transition-colors">
                {user.name.split(" ")[0]}
              </Link>
              <Link
                href={
                  user.role === "delivery_person"
                    ? "/delivery/account"
                    : user.role === "admin"
                    ? "/admin/account"
                    : user.role === "seller"
                    ? "/seller/account"
                    : "/account"
                }
                className="transition-colors hover:text-brand-600"
              >
                Account
              </Link>
              <button
                className="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-200 hover:text-slate-900 shadow-sm"
                onClick={() => {
                  clearAuth();
                  setUser(null);
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 border-l border-slate-200 pl-4">
              <Link 
                href="/login" 
                className="rounded-full bg-brand-600 px-5 py-2 text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-md"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
