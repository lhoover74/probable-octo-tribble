import { ShieldCheck } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { requireSession } from "@/lib/auth";
import { revokeOtherSessionsAction } from "@/lib/auth-actions";
import { listSecurityAuditLogsForUser, listSessionsForUser } from "@/lib/server/auth-store";

export const dynamic = "force-dynamic";

export default async function AccountSecurityPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; count?: string }>;
}) {
  const params = await searchParams;
  const session = await requireSession();
  const [sessions, auditLogs] = await Promise.all([
    listSessionsForUser(session.user.id),
    listSecurityAuditLogsForUser(session.user.id, 20)
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Account Security</h1>
        <p className="mt-2 text-sm text-slate-400">Manage your active sessions and review recent account-related security events.</p>
      </div>

      {params.status === "revoked" && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Revoked {params.count || 0} other active session(s).
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Active sessions" description="Sessions currently associated with your account.">
          <div className="space-y-3">
            {sessions.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-white">{entry.id === session.sessionId ? 'Current Session' : 'Active Session'}</p>
                  <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                    {entry.id === session.sessionId ? 'Current' : 'Other'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-300">Last seen: {entry.lastSeenAt}</p>
                <p className="mt-1 text-xs text-slate-500">Created: {entry.createdAt}</p>
                <p className="mt-1 text-xs text-slate-500">Expires: {entry.expiresAt}</p>
                <p className="mt-1 text-xs text-slate-500">{entry.userAgent || 'Unknown device'}</p>
              </div>
            ))}
          </div>
          <form action={revokeOtherSessionsAction} className="mt-4">
            <button type="submit" className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-3 text-sm font-medium text-rose-200">
              <ShieldCheck className="h-4 w-4" />
              Revoke Other Sessions
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Recent account activity" description="Most recent security and session events related to your account.">
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
    </div>
  );
}
