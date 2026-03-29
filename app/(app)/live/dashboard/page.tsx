import Link from "next/link";
import { AlertTriangle, Car, CheckCircle2, TowTruck, XCircle } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { properties } from "@/lib/mock-data";
import { readVehicles } from "@/lib/server/vehicle-store";

export default async function LiveDashboardPage() {
  const vehicles = await readVehicles();

  const pendingTow = vehicles.filter((vehicle) =>
    ["Marked for Tow", "Tow Requested", "Awaiting Tow Truck"].includes(vehicle.currentStatus)
  ).length;
  const towRequested = vehicles.filter((vehicle) => vehicle.currentStatus === "Tow Requested").length;
  const towed = vehicles.filter((vehicle) => vehicle.currentStatus === "Towed").length;
  const resolved = vehicles.filter((vehicle) =>
    ["Released", "Cancelled", "Cleared/Resolved"].includes(vehicle.currentStatus)
  ).length;

  const recentActivity = vehicles
    .flatMap((vehicle) =>
      vehicle.activity.map((activity) => ({
        ...activity,
        plate: vehicle.plate,
        vehicleId: vehicle.id,
        status: vehicle.currentStatus
      }))
    )
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Live Dashboard</h1>
        <p className="mt-2 text-sm text-slate-400">
          File-backed operational summary. New records and updates will change these counts.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Vehicles In Store" value={vehicles.length} icon={Car} />
        <MetricCard label="Pending Tow" value={pendingTow} icon={AlertTriangle} />
        <MetricCard label="Tow Requested" value={towRequested} icon={TowTruck} />
        <MetricCard label="Vehicles Towed" value={towed} icon={CheckCircle2} />
        <MetricCard label="Resolved" value={resolved} icon={XCircle} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Counts by property" description="Current case volume by managed location.">
          <div className="space-y-4">
            {properties.map((property) => {
              const count = vehicles.filter((vehicle) => vehicle.propertyName === property.name).length;
              return (
                <div key={property.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{property.name}</p>
                      <p className="mt-1 text-sm text-slate-400">{property.address}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-800 px-4 py-2 text-lg font-semibold text-white">{count}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Status mix" description="Open and closed case distribution.">
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(vehicles.map((vehicle) => vehicle.currentStatus))).map((status) => (
              <StatusBadge key={status} status={status} />
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Recent activity" description="Latest record updates across the live data store.">
        <div className="space-y-4">
          {recentActivity.map((entry) => (
            <Link
              key={entry.id}
              href={`/live/vehicles/${entry.vehicleId}`}
              className="block rounded-2xl border border-slate-800 bg-slate-950/40 p-4 transition hover:border-slate-700"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-white">{entry.type}</p>
                <span className="text-sm text-slate-400">{entry.plate}</span>
                <StatusBadge status={entry.status} />
              </div>
              <p className="mt-2 text-sm text-slate-300">{entry.detail}</p>
              <p className="mt-2 text-xs text-slate-500">
                {entry.by} • {entry.timestamp}
              </p>
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
