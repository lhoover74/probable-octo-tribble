import { notFound } from "next/navigation";
import { FileText, Upload } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { statuses, vehicles } from "@/lib/mock-data";
import { formatDateTime } from "@/lib/utils";

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = vehicles.find((entry) => entry.id === id);

  if (!vehicle) {
    notFound();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <SectionCard>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
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
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
                <FileText className="h-4 w-4" />
                Print / Export
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-medium text-slate-950">
                <Upload className="h-4 w-4" />
                Add Evidence
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Property</p>
              <p className="mt-2 font-medium text-white">{vehicle.propertyName}</p>
              <p className="mt-1 text-sm text-slate-400">{vehicle.zone} • {vehicle.exactLocation}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tow reason</p>
              <p className="mt-2 font-medium text-white">{vehicle.towReason}</p>
              <p className="mt-1 text-sm text-slate-400">Unit / Resident: {vehicle.unitAssociation || "Unknown"}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Towing company</p>
              <p className="mt-2 font-medium text-white">{vehicle.towingCompany || "Unassigned"}</p>
              <p className="mt-1 text-sm text-slate-400">Ref: {vehicle.towReferenceNumber || "Pending"}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[
              ["First Observed", vehicle.dateTimeFirstObserved],
              ["Warning Placed", vehicle.dateTimeWarningPlaced],
              ["Marked for Tow", vehicle.dateTimeMarkedForTow],
              ["Tow Requested", vehicle.dateTimeTowRequested],
              ["Tow Completed", vehicle.dateTimeTowCompleted],
              ["Last Updated By", vehicle.lastUpdatedBy]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
                <p className="mt-2 text-sm font-medium text-white">
                  {label === "Last Updated By" ? String(value) : formatDateTime(String(value || ""))}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Tow workflow" description="Every status change appends to the preserved history.">
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                className={`rounded-2xl border px-4 py-3 text-sm ${vehicle.currentStatus === status ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-slate-800 bg-slate-950 text-slate-300"}`}
              >
                {status}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Officer notes" description="Narrative notes, resident contact, and tow authorization details.">
          <textarea
            rows={4}
            defaultValue={vehicle.notes}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white"
          />
          <button className="mt-4 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-medium text-slate-950">Save Note</button>
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard title="Photos and evidence" description="Time-stamped uploads connected to this record.">
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

        <SectionCard title="Activity timeline" description="Chronological log of record creation, edits, statuses, uploads, and notes.">
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
