import Link from "next/link";
import { Car, FileText, Home, Plus, Settings, TowTruck, Users, Building2 } from "lucide-react";
import { ReactNode } from "react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/vehicles/new", label: "Add Vehicle", icon: Plus },
  { href: "/vehicles", label: "Vehicle Records", icon: Car },
  { href: "/tow-requests", label: "Tow Requests", icon: TowTruck },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/users", label: "Users", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-slate-800 bg-slate-950/70 p-6 lg:block">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-lg font-semibold text-white">TowTrack</p>
            <p className="mt-1 text-sm text-slate-400">Browser-first tow operations</p>
          </div>

          <nav className="mt-6 space-y-2">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm text-slate-300 transition hover:border-slate-800 hover:bg-slate-900"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-white">TowTrack Web</p>
                <p className="text-sm text-slate-400">Responsive website for phones, tablets, and desktop</p>
              </div>
              <Link
                href="/vehicles/new"
                className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
              >
                New Record
              </Link>
            </div>
          </header>

          <main className="flex-1 p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8">{children}</main>

          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950/95 px-3 py-3 backdrop-blur lg:hidden">
            <div className="grid grid-cols-4 gap-2">
              {[
                { href: "/dashboard", label: "Home", icon: Home },
                { href: "/vehicles/new", label: "Add", icon: Plus },
                { href: "/vehicles", label: "Records", icon: Car },
                { href: "/tow-requests", label: "Tow", icon: TowTruck }
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
