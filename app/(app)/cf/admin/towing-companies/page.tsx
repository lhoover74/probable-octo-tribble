import { PlusCircle } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { requireRole } from "@/lib/auth";
import { createCloudflareTowingCompanyAction } from "@/lib/cloudflare-management-actions";
import { readTowingCompaniesFromD1 } from "@/lib/server/d1-management-store";

export const dynamic = "force-dynamic";

export default async function CloudflareAdminTowingCompaniesPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const session = await requireRole(["Admin"]);
  const companies = await readTowingCompaniesFromD1();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Towing Companies</h1>
        <p className="mt-2 text-sm text-slate-400">Signed in as {session.user.name}. Manage towing companies used by properties and intake forms.</p>
      </div>

      {params.status === "created" && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Towing company created successfully.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Active towing companies" description="Companies currently available in Cloudflare D1.">
          <div className="space-y-4">
            {companies.map((company) => (
              <div key={company.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{company.company_name}</p>
                    <p className="mt-1 text-sm text-slate-400">{company.phone} • {company.email}</p>
                  </div>
                  <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">{company.active ? 'Active' : 'Inactive'}</span>
                </div>
                <p className="mt-3 text-sm text-slate-300">Dispatch: {company.dispatch_contact}</p>
                <p className="mt-2 text-sm text-slate-500">{company.notes}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Add towing company" description="Create a towing company record for the operations workflow.">
          <form action={createCloudflareTowingCompanyAction} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Company Name</span>
              <input name="companyName" required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Phone</span>
              <input name="phone" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Email</span>
              <input name="email" type="email" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Dispatch Contact</span>
              <input name="dispatchContact" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Notes</span>
              <textarea name="notes" rows={3} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
              <input type="checkbox" name="active" defaultChecked className="h-4 w-4 rounded border-slate-700 bg-slate-950" />
              Active company
            </label>
            <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-medium text-slate-950">
              <PlusCircle className="h-4 w-4" />
              Create Towing Company
            </button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
