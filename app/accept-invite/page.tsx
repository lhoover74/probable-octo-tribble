import Link from "next/link";
import { SectionCard } from "@/components/section-card";
import { acceptInviteAction } from "@/lib/auth-actions";
import { readInviteByToken } from "@/lib/server/auth-store";

export const dynamic = "force-dynamic";

function messageForError(error?: string) {
  switch (error) {
    case "password_mismatch":
      return "Passwords do not match.";
    case "password_too_short":
      return "Use a password with at least 10 characters.";
    case "invalid_or_expired":
      return "This invite is invalid or has expired.";
    case "missing_token":
      return "Invite token is missing.";
    default:
      return null;
  }
}

export default async function AcceptInvitePage({
  searchParams
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const params = await searchParams;
  const token = params.token || "";
  const invite = token ? await readInviteByToken(token) : null;
  const errorMessage = messageForError(params.error);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">Accept Invite</h1>
          <p className="mt-2 text-sm text-slate-400">Use your invite token to create your account password and access the platform.</p>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {errorMessage}
          </div>
        )}

        {!invite ? (
          <SectionCard title="Invite required" description="Open the full invite link from your administrator or paste the token in the address bar.">
            <Link href="/" className="inline-flex rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-medium text-slate-950">
              Back to sign in
            </Link>
          </SectionCard>
        ) : (
          <SectionCard title="Set your account password" description={`Invited as ${invite.role} for ${invite.property || "assigned property"}.`}>
            <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300">
              <p><span className="text-slate-500">Email:</span> {invite.email}</p>
              <p className="mt-1"><span className="text-slate-500">Expires:</span> {invite.expiresAt}</p>
            </div>
            <form action={acceptInviteAction} className="space-y-4">
              <input type="hidden" name="token" value={token} />
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Full Name</span>
                <input name="name" required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Password</span>
                <input name="password" type="password" minLength={10} required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Confirm Password</span>
                <input name="confirmPassword" type="password" minLength={10} required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
              </label>
              <button type="submit" className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-medium text-slate-950">
                Activate Account
              </button>
            </form>
          </SectionCard>
        )}
      </div>
    </main>
  );
}
