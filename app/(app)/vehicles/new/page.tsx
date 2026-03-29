import { Camera, Search, Upload, CheckCircle2 } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { properties, towReasons, statuses } from "@/lib/mock-data";

export default function NewVehiclePage() {
  const currentProperty = properties[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">Add Vehicle</h1>
          <p className="mt-2 text-sm text-slate-400">
            Mobile-first intake screen for plate and VIN capture, property assignment, violation notes, and evidence collection.
          </p>
        </div>

        <SectionCard title="New vehicle record" description="Fast entry flow for officers and staff working from a phone or tablet.">
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200">
              <Camera className="h-4 w-4" />
              Scan Plate
            </button>
            <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200">
              <Search className="h-4 w-4" />
              Scan VIN
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            Demo scan state: OCR completed with moderate confidence. Review and correct any field before saving.
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["License Plate", "KTR-9084"],
              ["Plate State", "IL"],
              ["VIN", "1N4BL4CV1KC173264"],
              ["Make", "Nissan"],
              ["Model", "Altima"],
              ["Year", "2019"],
              ["Color", "Black"],
              ["Body Style", "Sedan"],
              ["Exact Location", "Visitor row near Building 3"],
              ["Unit / Resident", "Unit 318"],
              ["Tow Reference", "Pending"],
            ].map(([label, placeholder]) => (
              <label key={label} className="block">
                <span className="mb-2 block text-sm text-slate-300">{label}</span>
                <input
                  defaultValue={placeholder}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white"
                />
              </label>
            ))}

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Property</span>
              <select className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white">
                {properties.map((property) => (
                  <option key={property.id}>{property.name}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Lot / Zone</span>
              <select className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white">
                {currentProperty.zones.map((zone) => (
                  <option key={zone}>{zone}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Tow Reason</span>
              <select className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white">
                {towReasons.map((reason) => (
                  <option key={reason}>{reason}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Initial Status</span>
              <select className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white">
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm text-slate-300">Notes</span>
              <textarea
                rows={4}
                defaultValue="Vehicle found in visitor row without permit after overnight cutoff."
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-medium text-slate-950">
              <CheckCircle2 className="h-4 w-4" />
              Save Vehicle Record
            </button>
            <button className="rounded-2xl border border-slate-800 bg-slate-950 px-5 py-3 text-sm text-slate-300">Reset Form</button>
          </div>
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard title="Possible matches" description="Duplicate detection, prior warnings, and repeat-offender history.">
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="font-medium text-white">PARK-77</p>
              <p className="mt-1 text-sm text-slate-400">Toyota Corolla • Northgate Apartments</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                <span className="rounded-full border border-slate-700 px-3 py-1">Prior history: 2</span>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-amber-200">Repeat offender</span>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Evidence checklist" description="Recommended uploads for legal and management review.">
          <div className="space-y-3">
            {[
              "Front plate",
              "Rear plate",
              "Full vehicle",
              "Parking position",
              "Violation evidence",
              "Damage condition"
            ].map((label) => (
              <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                <span className="text-sm text-slate-300">{label}</span>
                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-800 px-3 py-2 text-xs text-slate-300">
                  <Upload className="h-3.5 w-3.5" />
                  Upload
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
