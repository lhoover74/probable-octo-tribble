import { notFound } from "next/navigation";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { statuses } from "@/lib/mock-data";
import { updateCloudflareVehicleAction } from "@/lib/cloudflare-actions";
import { readVehicleFromD1 } from "@/lib/server/d1-vehicle-store";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CloudflareVehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await readVehicleFromD1(id);

  if (!vehicle) {
    notFound();
  }

  const updateAction = updateCloudflareVehicleAction.bind(null, id);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <SectionCard>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold text-white">{vehicle.plate}</h1>
            <StatusBadge status={vehicle.currentStatus} />
            {vehicle.watchlist && (
              <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs text-rose-200">Watchlist</span>
            )}
            {vehicle.repeatOffender && (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-200">Repeat offender</span>
            )}
          </div>
          <p className="mt-2 text-slate-300">
            {vehicle.year} {vehicle.make} {vehicle.model} • {vehicle.color} • {vehicle.bodyStyle}
          </p>
          <p className="mt-1 text-sm text-slate-500">VIN {vehicle.vin}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[
              ["Property", `${vehicle.propertyName} • ${vehicle.zone}`],
              ["Exact Location", vehicle.exactLocation],
              ["Tow Reason", vehicle.towReason],
              ["First Observed", formatDateTime(vehicle.dateTimeFirstObserved)],
              ["Tow Requested", formatDateTime(vehicle.dateTimeTowRequested)],
              ["Tow Company", vehicle.towingCompany || "—"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
                <p className="mt-2 text-sm font-medium text-white">{value}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Update Cloudflare record" description="Saving here writes to D1 and appends to the activity log.">
          <form action={updateAction} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Current Status</span>
              <select name="currentStatus" defaultValue={vehicle.currentStatus} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white">
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Notes</span>
              <textarea name="notes" rows={5} defaultValue={vehicle.notes} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
            </label>

            <button type="submit" className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-medium text-slate-950">
              Save Cloudflare Updates
            </button>
          </form>
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard title="Photos" description="Evidence entries linked to this D1-backed record.">
          <div className="space-y-3">
            {vehicle.photos.map((photo) => (
              <div key={photo.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="font-medium text-white">{photo.label}</p>
                <p className="mt-2 text-sm text-slate-400">Uploaded by {photo.user}</p>
                <p className="mt-1 text-xs text-slate-500">{photo.timestamp}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Activity timeline" description="Chronological D1-backed audit log.">
          <div className="space-y-4">
            {vehicle.activity.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium text-white">{entry.type}</p>
                  <p className="text-xs text-slate-500">{entry.timestamp}</p>
                </div>
                <p className="mt-2 text-sm text-slate-300">{entry.detail}</p>
                <p className="mt-2 text-xs text-slate-500">By {entry.by}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
