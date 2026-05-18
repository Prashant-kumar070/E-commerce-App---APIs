"use client";

import { StoreFooter } from "@/components/store-footer";
import { StoreHeader } from "@/components/store-header";
import { AccountProfile } from "@/components/account-profile";

export default function GeneralAccountPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f2f4fb]">
      <StoreHeader />
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 py-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">My Account</h1>
        <p className="text-slate-600 mb-8">Manage your profile and personal details.</p>
        <AccountProfile />
      </main>
      <StoreFooter />
    </div>
  );
}
