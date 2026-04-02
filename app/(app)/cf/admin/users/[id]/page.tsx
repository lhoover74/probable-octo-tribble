import Link from "next/link";
import { notFound } from "next/navigation";
import { Save } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { requireRole } from "@/lib/auth";
import { updateCloudflareUserAction } from "@/lib/cloudflare-management-actions";
import { readPropertiesFromD1, readUserFromD1 } from "@/lib/server/d1-management-store";

export const dynamic = "force-dynamic";

export default async function CloudflareAdminUserDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  await requireRole(["Admin"]);
  const [user, properties] = await Promise.all([
    readUserFromD1(id),
    readPropertiesFromD1({ includeInactive: true })
  ]);

  if (!user) {
    notFound();
  }

  const updateAction = updateCloudflareUserAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-white">Edit User</h1>
          <p className="mt-2 text-sm text-slate-400">Update login access, role, property assignment, or deactivate this user.</p>
        </div>
        <Link href="/users" className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
          Back to Users
        </Link>
      </div>

      {query.status === "saved" && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          User updated successfully.
        </div>
      )}

      <SectionCard title={user.name} description={user.email}>
        <form action={updateAction} className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Name</span>
            <input name="name" defaultValue={user.name} required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Email</span>
            <input name="email" type="email" defaultValue={user.email} required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Role</span>
            <select name="role" defaultValue={user.role} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white">
              {['Admin', 'Manager', 'Officer/Staff', 'Viewer'].map((roleOption) => (
                <option key={roleOption}>{roleOption}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Property</span>
            <input name="property" list="property-options" defaultValue={user.property} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
            <datalist id="property-options">
              {properties.map((property) => (
                <option key={property.id} value={property.name} />
              ))}
            </datalist>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Status</span>
            <select name="status" defaultValue={user.status} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white">
              {['Active', 'Inactive'].map((statusOption) => (
                <option key={statusOption}>{statusOption}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">New Password (optional)</span>
            <input name="password" type="password" minLength={10} className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
          </label>
          <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300">
            <p>Login status: {user.password_configured ? 'Password configured' : 'No password configured yet'}</p>
            <p className="mt-1 text-xs text-slate-500">Setting status to Inactive immediately blocks future logins and clears active sessions.</p>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-medium text-slate-950">
              <Save className="h-4 w-4" />
              Save User Changes
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
