import Link from "next/link";
import { SectionCard } from "@/components/section-card";

export default function LiveWorkspacePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Live Data Workspace</h1>
        <p className="mt-2 text-sm text-slate-400">
          These routes use the file-backed data store and server actions that were added after the original scaffold.
        </p>
      </div>

      <SectionCard title="Live routes" description="Use these pages to create and update actual records in data/vehicles.json.">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["/live/dashboard", "Live dashboard"],
            ["/live/vehicles", "Live vehicle records"],
            ["/live/vehicles/new", "Live add vehicle form"],
            ["/live/tow-requests", "Live tow queue"],
            ["/api/live-vehicles", "Live vehicles API"]
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
