"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { registerRequest } from "@/lib/api";
import { User, Mail, Lock, Building2, ArrowRight, Loader2, Sparkles } from "lucide-react";
import Product3DShowcase from "@/components/Product3DShowcase";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError("");

    const payload = {
      name: String(form.get("name")),
      email: String(form.get("email")),
      role: String(form.get("role")),
      phone: "0123456789",
      address: "Demo address",
      password: String(form.get("password")),
      password_confirmation: String(form.get("password")),
    };

    try {
      await registerRequest(payload);
      router.push("/login");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-surface">
      {/* Left Pane - Visuals */}
      <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-brand-950 p-12 text-white lg:flex">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 -left-1/4 h-96 w-96 rounded-full bg-brand-500/20 blur-[128px]" />
          <div className="absolute bottom-0 -right-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-[128px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>

        {/* Content Top */}
        <div className="relative z-10 animate-fade-in-up">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-glow">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">SwiftMarket</span>
          </div>
        </div>

        {/* 3D Showcase Middle */}
        <div className="relative z-10 flex-1 flex items-center justify-center -my-8">
          <Product3DShowcase />
        </div>

        {/* Content Bottom */}
        <div className="relative z-10 max-w-lg space-y-4 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
            Join the next generation of commerce.
          </h1>
          <p className="text-lg text-slate-300">
            Create an account to start shopping or selling with SwiftMarket's powerful ecosystem.
          </p>
        </div>
      </section>

      {/* Right Pane - Form */}
      <section className="flex w-full items-center justify-center p-6 sm:p-12 lg:w-1/2 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create your account</h2>
            <p className="mt-2 text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-brand-600 transition-colors hover:text-brand-500 hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            {/* Full Name Input */}
            <div className="group relative">
              <label className="mb-2 block text-sm font-medium text-slate-700">Full Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-4 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-500" />
                <input
                  name="name"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white/50 py-3.5 pl-12 pr-4 text-slate-900 outline-none backdrop-blur-sm transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 hover:border-slate-300"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="group relative">
              <label className="mb-2 block text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-500" />
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white/50 py-3.5 pl-12 pr-4 text-slate-900 outline-none backdrop-blur-sm transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 hover:border-slate-300"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group relative">
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-500" />
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white/50 py-3.5 pl-12 pr-4 text-slate-900 outline-none backdrop-blur-sm transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 hover:border-slate-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Role Select */}
            <div className="group relative">
              <label className="mb-2 block text-sm font-medium text-slate-700">Account Type</label>
              <div className="relative flex items-center">
                <Building2 className="absolute left-4 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-brand-500" />
                <select
                  name="role"
                  required
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white/50 py-3.5 pl-12 pr-4 text-slate-900 outline-none backdrop-blur-sm transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 hover:border-slate-300"
                >
                  <option value="customer">Customer (Shopper)</option>
                  <option value="seller">Seller (Merchant)</option>
                </select>
                {/* Custom Chevron for select */}
                <div className="pointer-events-none absolute right-4 text-slate-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-brand-500 hover:shadow-glow focus:outline-none focus:ring-4 focus:ring-brand-500/20 disabled:opacity-70 disabled:hover:shadow-soft"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
