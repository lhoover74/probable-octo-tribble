import { Phone } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { properties, towingCompanies, vehicles } from "@/lib/mock-data";

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Properties</h1>
        <p className="mt-2 text-sm text-slate-400">
          Managed properties, zone structure, towing rules, and default towing company assignments.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <SectionCard title="Properties" description="Multi-property support with rules, notes, and default tow routing.">
          <div className="space-y-4">
            {properties.map((property) => (
              <div key={property.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-lg font-medium text-white">{property.name}</p>
                    <p className="mt-1 text-sm text-slate-400">{property.address}</p>
                    <p className="mt-3 text-sm text-slate-300">Code: {property.code}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 px-4 py-3 text-sm text-slate-300">
                    Active cases: {vehicles.filter((vehicle) => vehicle.propertyName === property.name).length}
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Zones / lots</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {property.zones.map((zone) => (
                        <span key={zone} className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                          {zone}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Default towing company</p>
                    <p className="mt-2 text-sm text-white">{property.defaultTowCompany}</p>
                    <p className="mt-2 text-sm text-slate-400">{property.towingRules}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Towing companies" description="Dispatch contacts and company routing references.">
          <div className="space-y-4">
            {towingCompanies.map((company) => (
              <div key={company.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-white">{company.companyName}</p>
                  <span className={`rounded-full px-3 py-1 text-xs ${company.active ? "bg-emerald-500/15 text-emerald-300" : "bg-zinc-500/15 text-zinc-300"}`}>
                    {company.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-500" /> {company.phone}</p>
                  <p>{company.email}</p>
                  <p className="text-slate-400">Dispatch: {company.dispatchContact}</p>
                  <p className="text-slate-500">{company.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
