import { Download } from "lucide-react";
import { SectionCard } from "@/components/section-card";

const reports = [
  ["Daily Vehicle Log", "Full observed and active vehicle record export."],
  ["Open Tow List", "Cases currently marked for tow, requested, or awaiting truck."],
  ["Completed Tow History", "Completed tow outcomes with timestamps and company references."],
  ["Cancelled Tow History", "Cleared, cancelled, or released records for review."],
  ["Activity by Property", "Count and timeline grouped by property and zone."],
  ["Activity by User", "Officer, manager, and admin action totals."],
  ["Activity by Towing Company", "Dispatch volume, completion counts, and reference history."],
  ["Violation Trends", "Tow reasons and repeat-offender patterns over time."]
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Reports</h1>
        <p className="mt-2 text-sm text-slate-400">
          Export and print layouts for management review, towing coordination, and legal documentation.
        </p>
      </div>

      <SectionCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium text-white">Report range</p>
            <p className="mt-1 text-sm text-slate-400">Preview filter controls for daily and historical reports.</p>
          </div>
          <div className="flex gap-3">
            <select className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white">
              <option>Today</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Month</option>
            </select>
            <button className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-medium text-slate-950">
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map(([title, detail]) => (
          <SectionCard key={title} title={title} description={detail}>
            <div className="flex gap-2">
              <button className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">Preview</button>
              <button className="rounded-2xl bg-slate-200 px-4 py-3 text-sm font-medium text-slate-950">Print Layout</button>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
