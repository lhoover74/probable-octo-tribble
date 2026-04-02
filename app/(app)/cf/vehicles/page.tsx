import Link from "next/link";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { readVehiclesFromD1 } from "@/lib/server/d1-vehicle-store";
import { readPropertiesFromD1 } from "@/lib/server/d1-management-store";
import { formatDateTime } from "@/lib/utils";
import { statuses } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export default async function CloudflareVehiclesPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string; property?: string }>;
}) {
  const params = await searchParams;
  const [vehicles, properties] = await Promise.all([readVehiclesFromD1(), readPropertiesFromD1()]);

  const q = (params.q || "").trim().toLowerCase();
  const status = (params.status || "").trim();
  const property = (params.property || "").trim();

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesQuery =
      !q ||
      [vehicle.plate, vehicle.vin, vehicle.make, vehicle.model, vehicle.color, vehicle.towReason]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    const matchesStatus = !status || vehicle.currentStatus === status;
    const matchesProperty = !property || vehicle.propertyName === property;
    return matchesQuery && matchesStatus && matchesProperty;
  });

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

      <SectionCard title="Filters" description="Search and narrow the D1 vehicle record list.">
        <form className="grid gap-4 md:grid-cols-4">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm text-slate-300">Search plate, VIN, make, model, color, or reason</span>
            <input name="q" defaultValue={params.q || ""} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Status</span>
            <select name="status" defaultValue={status} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white">
              <option value="">All statuses</option>
              {statuses.map((statusOption) => (
                <option key={statusOption}>{statusOption}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Property</span>
            <select name="property" defaultValue={property} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white">
              <option value="">All properties</option>
              {properties.map((propertyOption) => (
                <option key={propertyOption.id}>{propertyOption.name}</option>
              ))}
            </select>
          </label>
          <div className="md:col-span-4 flex gap-3">
            <button type="submit" className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-medium text-slate-950">
              Apply Filters
            </button>
            <Link href="/vehicles" className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
              Clear
            </Link>
          </div>
        </form>
      </SectionCard>

      <SectionCard title={`Results (${filteredVehicles.length})`} description="Filtered D1-backed vehicle records.">
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
              {filteredVehicles.map((vehicle) => (
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
          {filteredVehicles.length === 0 && <p className="px-4 py-6 text-sm text-slate-400">No vehicle records matched the current filters.</p>}
        </div>
      </SectionCard>
    </div>
  );
}
