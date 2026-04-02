import Link from "next/link";
import { notFound } from "next/navigation";
import { Save } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { requireRole } from "@/lib/auth";
import { updateCloudflarePropertyAction } from "@/lib/cloudflare-management-actions";
import { readPropertyFromD1, readTowingCompaniesFromD1 } from "@/lib/server/d1-management-store";

export const dynamic = "force-dynamic";

export default async function CloudflareAdminPropertyDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  await requireRole(["Admin"]);
  const [property, towingCompanies] = await Promise.all([
    readPropertyFromD1(id),
    readTowingCompaniesFromD1({ includeInactive: true })
  ]);

  if (!property) {
    notFound();
  }

  const updateAction = updateCloudflarePropertyAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-white">Edit Property</h1>
          <p className="mt-2 text-sm text-slate-400">Update property details, towing rules, and deactivate when needed.</p>
        </div>
        <Link href="/properties" className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
          Back to Properties
        </Link>
      </div>

      {query.status === "saved" && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Property updated successfully.
        </div>
      )}

      <SectionCard title={property.name} description={property.address}>
        <form action={updateAction} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Name</span>
            <input name="name" defaultValue={property.name} required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Code</span>
            <input name="code" defaultValue={property.code} required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Address</span>
            <input name="address" defaultValue={property.address} required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Zones (comma separated)</span>
            <input name="zonesCsv" defaultValue={property.zones.join(', ')} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Towing Rules</span>
            <textarea name="towingRules" rows={3} defaultValue={property.towingRules} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Default Towing Company</span>
            <input name="defaultTowCompany" list="tow-company-options" defaultValue={property.defaultTowCompany} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
            <datalist id="tow-company-options">
              {towingCompanies.map((company) => (
                <option key={company.id} value={company.company_name} />
              ))}
            </datalist>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Notes</span>
            <textarea name="notes" rows={4} defaultValue={property.notes} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
            <input type="checkbox" name="active" defaultChecked={Boolean(property.active)} className="h-4 w-4 rounded border-slate-700 bg-slate-950" />
            Active property
          </label>
          <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-medium text-slate-950">
            <Save className="h-4 w-4" />
            Save Property Changes
          </button>
        </form>
      </SectionCard>
    </div>
  );
}
