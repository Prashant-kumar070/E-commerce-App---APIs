import { ReactNode } from "react";
import { StoreFooter } from "@/components/store-footer";
import { StoreHeader } from "@/components/store-header";

type ContentPageProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function ContentPage({ title, description, children }: ContentPageProps) {
  return (
    <div>
      <StoreHeader />
      <main className="mx-auto min-h-[70vh] max-w-[1000px] px-6 py-10">
        <h1 className="text-6xl font-bold">{title}</h1>
        <p className="mt-3 text-lg text-slate-600">{description}</p>
        {children ? <div className="mt-8">{children}</div> : null}
      </main>
      <StoreFooter />
    </div>
  );
}
