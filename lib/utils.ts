import { TowStatus } from "@/lib/types";

export function formatDateTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export function getStatusTone(status: TowStatus) {
  switch (status) {
    case "Observed":
      return "border-slate-700 bg-slate-800/80 text-slate-200";
    case "Warning Placed":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    case "Marked for Tow":
      return "border-orange-500/30 bg-orange-500/10 text-orange-200";
    case "Tow Requested":
      return "border-rose-500/30 bg-rose-500/10 text-rose-200";
    case "Awaiting Tow Truck":
      return "border-violet-500/30 bg-violet-500/10 text-violet-200";
    case "Towed":
      return "border-red-500/30 bg-red-500/10 text-red-200";
    case "Released":
      return "border-sky-500/30 bg-sky-500/10 text-sky-200";
    case "Cancelled":
      return "border-zinc-500/30 bg-zinc-500/10 text-zinc-200";
    case "Cleared/Resolved":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    default:
      return "border-slate-700 bg-slate-800/80 text-slate-200";
  }
}
