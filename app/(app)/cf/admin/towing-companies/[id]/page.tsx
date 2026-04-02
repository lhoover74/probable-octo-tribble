import Link from "next/link";
import { notFound } from "next/navigation";
import { Save } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { requireRole } from "@/lib/auth";
import { updateCloudflareTowingCompanyAction } from "@/lib/cloudflare-management-actions";
import { readTowingCompanyFromD1 } from "@/lib/server/d1-management-store";

export const dynamic = "force-dynamic";

export default async function CloudflareAdminTowingCompanyDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  await requireRole(["Admin"]);
  const company = await readTowingCompanyFromD1(id);

  if (!company) {
    notFound();
  }

  const updateAction = updateCloudflareTowingCompanyAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-white">Edit Towing Company</h1>
          <p className="mt-2 text-sm text-slate-400">Update dispatch details or deactivate this towing company.</p>
        </div>
        <Link href="/cf/admin/towing-companies" className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
          Back to Tow Companies
        </Link>
      </div>

      {query.status === "saved" && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Towing company updated successfully.
        </div>
      )}

      <SectionCard title={company.company_name} description={company.email}>
        <form action={updateAction} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Company Name</span>
            <input name="companyName" defaultValue={company.company_name} required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Phone</span>
            <input name="phone" defaultValue={company.phone} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Email</span>
            <input name="email" type="email" defaultValue={company.email} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Dispatch Contact</span>
            <input name="dispatchContact" defaultValue={company.dispatch_contact} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Notes</span>
            <textarea name="notes" rows={4} defaultValue={company.notes} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
            <input type="checkbox" name="active" defaultChecked={Boolean(company.active)} className="h-4 w-4 rounded border-slate-700 bg-slate-950" />
            Active company
          </label>
          <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-medium text-slate-950">
            <Save className="h-4 w-4" />
            Save Towing Company Changes
          </button>
        </form>
      </SectionCard>
    </div>
  );
}
