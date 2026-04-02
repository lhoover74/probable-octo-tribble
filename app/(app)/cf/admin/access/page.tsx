import { MailPlus } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { requireRole } from "@/lib/auth";
import { createInviteAction } from "@/lib/auth-actions";
import { readPropertiesFromD1 } from "@/lib/server/d1-management-store";
import { listPendingInvites, listSecurityAuditLogs } from "@/lib/server/auth-store";

export const dynamic = "force-dynamic";

export default async function CloudflareAdminAccessPage({
  searchParams
}: {
  searchParams: Promise<{ created?: string; email?: string; token?: string }>;
}) {
  const params = await searchParams;
  const session = await requireRole(["Admin"]);
  const [properties, pendingInvites, auditLogs] = await Promise.all([
    readPropertiesFromD1(),
    listPendingInvites(20),
    listSecurityAuditLogs(20)
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Access Management</h1>
        <p className="mt-2 text-sm text-slate-400">Signed in as {session.user.name}. Manage invites and review security-sensitive account activity.</p>
      </div>

      {params.created === "1" && params.token && (
        <SectionCard title="Invite created" description="No email provider is configured yet, so copy the invite link below and send it manually.">
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300">
            <p>Email: {params.email}</p>
            <p className="break-all text-emerald-300">/accept-invite?token={params.token}</p>
          </div>
        </SectionCard>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Create invite" description="Invite a user to activate their account and set a password.">
          <form action={createInviteAction} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Email</span>
              <input name="email" type="email" required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Role</span>
              <select name="role" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white">
                {['Admin', 'Manager', 'Officer/Staff', 'Viewer'].map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Property</span>
              <input name="property" list="access-property-options" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
              <datalist id="access-property-options">
                {properties.map((property) => (
                  <option key={property.id} value={property.name} />
                ))}
              </datalist>
            </label>
            <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-medium text-slate-950">
              <MailPlus className="h-4 w-4" />
              Create Invite
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Pending invites" description="Unaccepted invites that are still active.">
          <div className="space-y-3">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="font-medium text-white">{invite.email}</p>
                <p className="mt-1 text-sm text-slate-400">{invite.role} • {invite.property || 'No property set'}</p>
                <p className="mt-2 text-xs text-slate-500">Expires {invite.expiresAt}</p>
              </div>
            ))}
            {pendingInvites.length === 0 && <p className="text-sm text-slate-400">No active pending invites.</p>}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Recent security activity" description="Most recent security and access control events.">
        <div className="space-y-3">
          {auditLogs.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium text-white">{entry.action}</p>
                <p className="text-xs text-slate-500">{entry.createdAt}</p>
              </div>
              <p className="mt-2 text-sm text-slate-300">{entry.detail}</p>
              <p className="mt-2 text-xs text-slate-500">{entry.actorEmail || 'System'} • {entry.targetType}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
