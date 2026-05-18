import Link from "next/link";

export function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-[1280px] px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          <div className="md:col-span-2">
            <Link href="/" className="inline-block text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">
              SwiftMarket
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
              The next generation marketplace for seamless commerce. Discover premium products, exclusive deals, and lightning-fast delivery all in one place.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Company</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-500">
              <li><Link href="/about" className="transition-colors hover:text-brand-600">About Us</Link></li>
              <li><Link href="/careers" className="transition-colors hover:text-brand-600">Careers</Link></li>
              <li><Link href="/press" className="transition-colors hover:text-brand-600">Press</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Support</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-500">
              <li><Link href="/help" className="transition-colors hover:text-brand-600">Help Center</Link></li>
              <li><Link href="/terms" className="transition-colors hover:text-brand-600">Terms of Service</Link></li>
              <li><Link href="/privacy" className="transition-colors hover:text-brand-600">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-100 pt-8 sm:flex-row">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} SwiftMarket Inc. All rights reserved.
          </p>
          <div className="mt-4 flex gap-4 sm:mt-0">
            {/* Social icons placeholder */}
            <div className="h-8 w-8 rounded-full bg-slate-100 transition-colors hover:bg-slate-200" />
            <div className="h-8 w-8 rounded-full bg-slate-100 transition-colors hover:bg-slate-200" />
            <div className="h-8 w-8 rounded-full bg-slate-100 transition-colors hover:bg-slate-200" />
          </div>
        </div>
      </div>
    </footer>
  );
}
