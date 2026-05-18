import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

type DashboardShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  links: { href: string; label: string }[];
};

export function DashboardShell({
  title,
  subtitle,
  children,
  links,
}: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto grid min-h-screen max-w-[1440px] grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-slate-200 bg-white p-6 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="mb-10">
            <Link href="/" className="inline-block text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-brand-600 to-brand-400">
              SwiftMarket
            </Link>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Workspace
            </p>
          </div>
          <nav className="space-y-1.5">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200/50"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className={`transform transition-transform duration-300 ${isActive ? "translate-x-1" : "group-hover:translate-x-1"}`}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="relative flex flex-col p-8 lg:p-12">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="animate-fade-in-up text-4xl font-extrabold tracking-tight text-slate-900">
                {title}
              </h1>
              {subtitle ? (
                <p className="animate-fade-in-up mt-2 text-lg text-slate-500" style={{ animationDelay: '50ms' }}>
                  {subtitle}
                </p>
              ) : null}
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href={links.find(l => l.label.toLowerCase() === 'account')?.href ?? '#'}
                className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-600 hover:shadow-md"
              >
                Account Settings
              </Link>
            </div>
          </header>
          
          <div className="animate-fade-in-up flex-1" style={{ animationDelay: '100ms' }}>
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
