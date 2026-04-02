import Link from "next/link";
import { cookies } from "next/headers";
import { Building2, PlusCircle } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { createCloudflarePropertyAction } from "@/lib/cloudflare-management-actions";
import { readPropertiesFromD1, readTowingCompaniesFromD1 } from "@/lib/server/d1-management-store";

export const dynamic = "force-dynamic";

export default async function CloudflareAdminPropertiesPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const role = cookieStore.get("demo_role")?.value;
  const userName = cookieStore.get("demo_user_name")?.value;

  if (role !== "Admin") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">Property Management</h1>
          <p className="mt-2 text-sm text-slate-400">This page is restricted to the Admin role.</p>
        </div>
        <SectionCard title="Access denied" description="Sign in with the generic login as Admin or choose the Admin demo user.">
          <Link href="/" className="inline-flex rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-medium text-slate-950">
            Back to sign in
          </Link>
        </SectionCard>
      </div>
    );
  }

  const [properties, towingCompanies] = await Promise.all([
    readPropertiesFromD1(),
    readTowingCompaniesFromD1()
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Property Management</h1>
        <p className="mt-2 text-sm text-slate-400">Signed in as {userName || "Admin"}. Add and review managed properties in D1.</p>
      </div>

      {params.status === "created" && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Property created successfully.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Current properties" description="Properties currently stored in the D1 database.">
          <div className="space-y-4">
            {properties.map((property) => (
              <div key={property.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{property.name}</p>
                    <p className="mt-1 text-sm text-slate-400">{property.address}</p>
                  </div>
                  <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">{property.code}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {property.zones.map((zone) => (
                    <span key={zone} className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                      {zone}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm text-slate-400">Default tow: {property.defaultTowCompany}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Add property" description="Create a new managed property record.">
          <form action={createCloudflarePropertyAction} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Name</span>
              <input name="name" required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Code</span>
              <input name="code" required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Address</span>
              <input name="address" required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Zones (comma separated)</span>
              <input name="zonesCsv" placeholder="Lot A, Visitor, Fire Lane" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Towing Rules</span>
              <textarea name="towingRules" rows={3} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Default Towing Company</span>
              <input name="defaultTowCompany" list="tow-company-options" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
              <datalist id="tow-company-options">
                {towingCompanies.map((company) => (
                  <option key={company.id} value={company.company_name} />
                ))}
              </datalist>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Notes</span>
              <textarea name="notes" rows={3} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
            </label>
            <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-medium text-slate-950">
              <PlusCircle className="h-4 w-4" />
              Create Property
            </button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
