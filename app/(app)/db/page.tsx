import Link from "next/link";
import { SectionCard } from "@/components/section-card";

export default function DbWorkspacePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Database Workspace</h1>
        <p className="mt-2 text-sm text-slate-400">
          SQLite-backed routes for TowTrack. These pages use a database file instead of the JSON store.
        </p>
      </div>

      <SectionCard title="Database routes" description="Use these pages to work against the SQLite-backed implementation.">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["/db/dashboard", "DB dashboard"],
            ["/db/vehicles", "DB vehicle records"],
            ["/db/vehicles/new", "DB add vehicle form"],
            ["/db/tow-requests", "DB tow queue"],
            ["/api/db-vehicles", "DB vehicles API"]
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-4 text-sm text-slate-200 transition hover:border-slate-700"
            >
              <p className="font-medium text-white">{label}</p>
              <p className="mt-1 text-xs text-slate-500">{href}</p>
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
