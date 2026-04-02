import { UserPlus } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { requireRole } from "@/lib/auth";
import { createCloudflareUserAction } from "@/lib/cloudflare-management-actions";
import { readPropertiesFromD1, readUsersFromD1 } from "@/lib/server/d1-management-store";

export const dynamic = "force-dynamic";

export default async function CloudflareAdminUsersPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const session = await requireRole(["Admin"]);
  const [users, properties] = await Promise.all([readUsersFromD1(), readPropertiesFromD1()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">User Management</h1>
        <p className="mt-2 text-sm text-slate-400">Signed in as {session.user.name}. Add and review users stored in Cloudflare D1.</p>
      </div>

      {params.status === "created" && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          User created successfully.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Current users" description="Users currently stored in the D1 database.">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 font-medium">Login</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-800">
                    <td className="px-4 py-4">
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-300">{user.role}</td>
                    <td className="px-4 py-4 text-slate-300">{user.property}</td>
                    <td className="px-4 py-4 text-slate-300">{user.password_configured ? 'Ready' : 'No password'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Add user" description="Create a new user record with a password for system access.">
          <form action={createCloudflareUserAction} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Name</span>
              <input name="name" required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Email</span>
              <input name="email" type="email" required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Password</span>
              <input name="password" type="password" minLength={10} required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Role</span>
              <select name="role" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white">
                {['Admin', 'Manager', 'Officer/Staff', 'Viewer'].map((roleOption) => (
                  <option key={roleOption}>{roleOption}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Property</span>
              <input name="property" list="property-options" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
              <datalist id="property-options">
                {properties.map((property) => (
                  <option key={property.id} value={property.name} />
                ))}
              </datalist>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Status</span>
              <select name="status" defaultValue="Active" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white">
                {['Active', 'Inactive'].map((statusOption) => (
                  <option key={statusOption}>{statusOption}</option>
                ))}
              </select>
            </label>
            <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-medium text-slate-950">
              <UserPlus className="h-4 w-4" />
              Create User
            </button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
