import Link from "next/link";
import { ContentPage } from "@/components/content-page";

export default function SellPage() {
  return (
    <ContentPage
      title="Sell on SwiftMarket"
      description="Set up your seller storefront and manage listings from Seller Central."
    >
      <div className="flex gap-3">
        <Link href="/register" className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white">
          Become a Seller
        </Link>
        <Link href="/seller/dashboard" className="rounded-lg border border-slate-300 px-4 py-2 font-semibold">
          Open Seller Dashboard
        </Link>
      </div>
    </ContentPage>
  );
}
