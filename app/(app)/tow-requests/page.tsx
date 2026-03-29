import Link from "next/link";
import { AlertTriangle, Clock3, TowTruck } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { vehicles } from "@/lib/mock-data";
import { formatDateTime } from "@/lib/utils";

export default function TowRequestsPage() {
  const active = vehicles.filter((vehicle) =>
    ["Marked for Tow", "Tow Requested", "Awaiting Tow Truck"].includes(vehicle.currentStatus)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Tow Requests</h1>
        <p className="mt-2 text-sm text-slate-400">
          Dispatch-focused queue for marked, requested, and awaiting truck cases.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Marked for Tow" value={vehicles.filter((v) => v.currentStatus === "Marked for Tow").length} icon={AlertTriangle} />
        <MetricCard label="Tow Requested" value={vehicles.filter((v) => v.currentStatus === "Tow Requested").length} icon={TowTruck} />
        <MetricCard label="Awaiting Tow Truck" value={vehicles.filter((v) => v.currentStatus === "Awaiting Tow Truck").length} icon={Clock3} />
      </div>

      <SectionCard title="Active tow queue" description="Open cases waiting for tow action or arrival.">
        <div className="space-y-3">
          {active.map((vehicle) => (
            <Link
              key={vehicle.id}
              href={`/vehicles/${vehicle.id}`}
              className="block rounded-2xl border border-slate-800 bg-slate-950/40 p-4 transition hover:border-slate-700"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-white">{vehicle.plate}</p>
                    <StatusBadge status={vehicle.currentStatus} />
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    {vehicle.propertyName} • {vehicle.zone} • {vehicle.exactLocation}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {vehicle.towReason} • {vehicle.towingCompany || "No company assigned"}
                  </p>
                </div>
                <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Observed</p>
                    <p className="mt-1">{formatDateTime(vehicle.dateTimeFirstObserved)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tow Requested</p>
                    <p className="mt-1">{formatDateTime(vehicle.dateTimeTowRequested)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tow Ref</p>
                    <p className="mt-1">{vehicle.towReferenceNumber || "Pending"}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {active.length === 0 && <p className="text-sm text-slate-400">No open tow queue items.</p>}
        </div>
      </SectionCard>
    </div>
  );
}
