import { StoreFooter } from "@/components/store-footer";
import { StoreHeader } from "@/components/store-header";

type OrderDetailPageProps = {
  params: { id: string };
};

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  return (
    <div>
      <StoreHeader />
      <main className="mx-auto min-h-[70vh] max-w-[1280px] px-6 py-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500">Orders &gt; Order #{params.id}</p>
            <h1 className="text-6xl font-bold">Order Details</h1>
            <p className="mt-2 text-slate-600">Shipment tracking and item summary.</p>
          </div>
        </div>
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-4">
            {["Ordered", "Processed", "Shipped", "Delivered"].map((step, index) => (
              <div key={step} className="text-center">
                <div
                  className={`mx-auto h-12 w-12 rounded-full ${index < 3 ? "bg-brand-600" : "bg-slate-200"}`}
                />
                <p className="mt-2 font-semibold">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
