import Link from "next/link";
import { ContentPage } from "@/components/content-page";

export default function SupportPage() {
  return (
    <ContentPage
      title="Contact Support"
      description="Need help with an order, payment, or account? Reach out to our support team."
    >
      <Link href="/help" className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white">
        Open Help Center
      </Link>
    </ContentPage>
  );
}
