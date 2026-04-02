import Link from "next/link";
import { SectionCard } from "@/components/section-card";
import { completePasswordResetAction, requestPasswordResetAction } from "@/lib/auth-actions";
import { readPasswordResetToken } from "@/lib/server/auth-store";

export const dynamic = "force-dynamic";

function messageForError(error?: string) {
  switch (error) {
    case "password_mismatch":
      return "Passwords do not match.";
    case "password_too_short":
      return "Use a password with at least 10 characters.";
    case "invalid_or_expired":
      return "This reset link is invalid or has expired.";
    case "missing_token":
      return "Reset token is missing.";
    default:
      return null;
  }
}

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string; error?: string; requested?: string; email?: string; sent?: string }>;
}) {
  const params = await searchParams;
  const token = params.token || "";
  const tokenRecord = token ? await readPasswordResetToken(token) : null;
  const errorMessage = messageForError(params.error);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">Reset Password</h1>
          <p className="mt-2 text-sm text-slate-400">Request a reset link or complete a password reset using an active token.</p>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {errorMessage}
          </div>
        )}

        {params.requested === "1" && params.sent === "1" && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Password reset email sent to {params.email}. Check your inbox for the reset link.
          </div>
        )}

        {params.requested === "1" && params.sent === "0" && token && (
          <SectionCard title="Reset link generated" description="Email delivery is not configured yet, so use the direct reset link below.">
            <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300">
              <p>Email: {params.email || tokenRecord?.email || "Requested account"}</p>
              <p className="break-all text-emerald-300">/reset-password?token={token}</p>
            </div>
          </SectionCard>
        )}

        <SectionCard title="Request reset" description="Enter your account email to generate a reset token.">
          <form action={requestPasswordResetAction} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Email</span>
              <input name="email" type="email" defaultValue={params.email || ""} required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
            </label>
            <button type="submit" className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-medium text-slate-950">
              Generate Reset Token
            </button>
          </form>
        </SectionCard>

        {tokenRecord && (
          <SectionCard title="Set new password" description={`Resetting password for ${tokenRecord.email}.`}>
            <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300">
              <p>Token expires: {tokenRecord.expiresAt}</p>
            </div>
            <form action={completePasswordResetAction} className="space-y-4">
              <input type="hidden" name="token" value={token} />
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">New Password</span>
                <input name="password" type="password" minLength={10} required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Confirm Password</span>
                <input name="confirmPassword" type="password" minLength={10} required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
              </label>
              <button type="submit" className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-medium text-slate-950">
                Update Password
              </button>
            </form>
          </SectionCard>
        )}

        <Link href="/" className="inline-flex rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
