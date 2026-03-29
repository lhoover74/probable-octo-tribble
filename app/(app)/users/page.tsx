import { UserCog } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { roleCapabilities, users } from "@/lib/mock-data";

export default function UsersPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <SectionCard title="Users and roles" description="Role-based access for admin, manager, officer/staff, and viewer.">
        <div className="flex items-center justify-between gap-3">
          <div />
          <button className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-medium text-slate-950">
            <UserCog className="h-4 w-4" />
            Add User
          </button>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Property</th>
                <th className="px-4 py-3 font-medium">Status</th>
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
                  <td className="px-4 py-4 text-slate-300">{user.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Role permissions" description="Summary of what each role can do in the website.">
        <div className="space-y-4">
          {roleCapabilities.map((item) => (
            <div key={item.role} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="font-medium text-white">{item.role}</p>
              <p className="mt-2 text-sm text-slate-400">{item.detail}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
