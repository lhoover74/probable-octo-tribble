import { LucideIcon } from "lucide-react";

export function MetricCard({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
        </div>
        <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-300">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
