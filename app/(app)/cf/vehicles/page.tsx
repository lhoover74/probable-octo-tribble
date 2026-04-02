import Link from "next/link";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { readVehiclesFromD1 } from "@/lib/server/d1-vehicle-store";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CloudflareVehiclesPage() {
  const vehicles = await readVehiclesFromD1();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-white">Cloudflare Vehicle Records</h1>
          <p className="mt-2 text-sm text-slate-400">D1-backed records for the main app deployment path.</p>
        </div>
        <Link href="/cf/vehicles/new" className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-medium text-slate-950">
          Add Vehicle
        </Link>
      </div>

      <SectionCard>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Plate</th>
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Property</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Observed</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-t border-slate-800">
                  <td className="px-4 py-4">
                    <Link href={`/cf/vehicles/${vehicle.id}`} className="font-medium text-white hover:text-emerald-300">
                      {vehicle.plate}
                    </Link>
                    <p className="text-xs text-slate-500">{vehicle.plateState}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                    <p className="text-xs text-slate-500">{vehicle.color} • {vehicle.bodyStyle}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{vehicle.propertyName}</td>
                  <td className="px-4 py-4 text-slate-300">{vehicle.towReason}</td>
                  <td className="px-4 py-4"><StatusBadge status={vehicle.currentStatus} /></td>
                  <td className="px-4 py-4 text-slate-300">{formatDateTime(vehicle.dateTimeFirstObserved)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
