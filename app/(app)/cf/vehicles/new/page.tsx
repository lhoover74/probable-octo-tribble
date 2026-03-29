import { CheckCircle2 } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { createCloudflareVehicleAction } from "@/lib/cloudflare-actions";
import { properties, towReasons, statuses } from "@/lib/mock-data";

export default function CloudflareNewVehiclePage() {
  const property = properties[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Cloudflare Add Vehicle</h1>
        <p className="mt-2 text-sm text-slate-400">This form saves directly into the Cloudflare D1 database binding.</p>
      </div>

      <SectionCard title="Create D1-backed record" description="Submitting writes to Cloudflare D1 and redirects to the saved record.">
        <form action={createCloudflareVehicleAction} className="grid gap-4 md:grid-cols-2">
          {[
            ["plate", "License Plate", "KTR-9084"],
            ["plateState", "Plate State", "IL"],
            ["vin", "VIN", "1N4BL4CV1KC173264"],
            ["make", "Make", "Nissan"],
            ["model", "Model", "Altima"],
            ["year", "Year", "2019"],
            ["color", "Color", "Black"],
            ["bodyStyle", "Body Style", "Sedan"],
            ["exactLocation", "Exact Location", "Visitor row near Building 3"],
            ["unitAssociation", "Unit / Resident", "Unit 318"]
          ].map(([name, label, defaultValue]) => (
            <label key={name} className="block">
              <span className="mb-2 block text-sm text-slate-300">{label}</span>
              <input name={name} defaultValue={defaultValue} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
            </label>
          ))}

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Property</span>
            <select name="propertyName" defaultValue={property.name} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white">
              {properties.map((entry) => (
                <option key={entry.id}>{entry.name}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Zone</span>
            <select name="zone" defaultValue={property.zones[0]} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white">
              {property.zones.map((zone) => (
                <option key={zone}>{zone}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Tow Reason</span>
            <select name="towReason" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white">
              {towReasons.map((reason) => (
                <option key={reason}>{reason}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Initial Status</span>
            <select name="currentStatus" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white">
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Towing Company</span>
            <input name="towingCompany" defaultValue={property.defaultTowCompany} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm text-slate-300">Notes</span>
            <textarea name="notes" rows={5} defaultValue="Vehicle found in visitor row without permit after overnight cutoff." className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
          </label>

          <div className="md:col-span-2">
            <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-medium text-slate-950">
              <CheckCircle2 className="h-4 w-4" />
              Save Cloudflare Vehicle Record
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
