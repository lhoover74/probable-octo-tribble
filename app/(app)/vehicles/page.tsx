import Link from "next/link";
import { Search, Download } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { towReasons, vehicles, properties, statuses } from "@/lib/mock-data";
import { formatDateTime } from "@/lib/utils";

export default function VehiclesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Vehicle Records</h1>
        <p className="mt-2 text-sm text-slate-400">
          Searchable record list for current and prior observations, warnings, tow requests, and outcomes.
        </p>
      </div>

      <SectionCard>
        <div className="grid gap-3 lg:grid-cols-[1.2fr_repeat(3,0.65fr)_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              readOnly
              placeholder="Search plate, VIN, make/model, property, unit, or location"
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 py-3 pl-11 pr-4 text-white"
            />
          </label>
          <select className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white">
            <option>All Statuses</option>
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <select className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white">
            <option>All Properties</option>
            {properties.map((property) => (
              <option key={property.id}>{property.name}</option>
            ))}
          </select>
          <select className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white">
            <option>All Reasons</option>
            {towReasons.map((reason) => (
              <option key={reason}>{reason}</option>
            ))}
          </select>
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </SectionCard>

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
                <th className="px-4 py-3 font-medium">Tow Company</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-t border-slate-800">
                  <td className="px-4 py-4">
                    <Link href={`/vehicles/${vehicle.id}`} className="font-medium text-white hover:text-emerald-300">
                      {vehicle.plate}
                    </Link>
                    <p className="text-xs text-slate-500">{vehicle.plateState}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                    <p className="text-xs text-slate-500">{vehicle.color} • {vehicle.bodyStyle}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    {vehicle.propertyName}
                    <p className="text-xs text-slate-500">{vehicle.zone} • {vehicle.exactLocation}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{vehicle.towReason}</td>
                  <td className="px-4 py-4"><StatusBadge status={vehicle.currentStatus} /></td>
                  <td className="px-4 py-4 text-slate-300">{formatDateTime(vehicle.dateTimeFirstObserved)}</td>
                  <td className="px-4 py-4 text-slate-300">{vehicle.towingCompany || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
