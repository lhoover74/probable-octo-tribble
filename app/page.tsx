import { redirect } from "next/navigation";
import { Shield, LockKeyhole, Clock3, Truck as TowTruck } from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import { loginAction, setupInitialAdminAction } from "@/lib/auth-actions";
import { hasAnyAuthCredentials } from "@/lib/server/auth-store";

export const dynamic = "force-dynamic";

function messageForError(error?: string) {
  switch (error) {
    case 'invalid_credentials':
      return 'Invalid email or password.';
    case 'password_mismatch':
      return 'Passwords do not match.';
    case 'password_too_short':
      return 'Use a password with at least 10 characters.';
    case 'setup_disabled':
      return 'Initial admin setup has already been completed.';
    default:
      return null;
  }
}

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const [session, hasCredentials] = await Promise.all([getCurrentSession(), hasAnyAuthCredentials()]);

  if (session) {
    redirect('/dashboard');
  }

  const errorMessage = messageForError(params.error);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 shadow-soft lg:p-12">
          <div className="inline-flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-300">
            <TowTruck className="h-4 w-4 text-emerald-300" />
            TowTrack Web
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Tow tracking built as a secure operations website.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Document vehicles, move cases through tow workflow, and keep a time-stamped record of what happened, when, and by whom.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: LockKeyhole,
                title: "Protected access",
                detail: "Password login, persistent sessions, and role-based actions."
              },
              {
                icon: Clock3,
                title: "Status workflow",
                detail: "Observed through tow completion with preserved history."
              },
              {
                icon: Shield,
                title: "Review-ready",
                detail: "Notes, photos, and activity preserved for operations and legal review."
              }
            ].map(({ icon: Icon, title, detail }) => (
              <div key={title} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                <Icon className="h-5 w-5 text-emerald-300" />
                <p className="mt-3 font-medium text-white">{title}</p>
                <p className="mt-2 text-sm text-slate-400">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6 shadow-soft lg:p-8">
          <h2 className="text-2xl font-semibold text-white">{hasCredentials ? 'Sign in' : 'Set up first admin'}</h2>
          <p className="mt-2 text-sm text-slate-400">
            {hasCredentials
              ? 'Use your email and password to access the TowTrack operations workspace.'
              : 'Create the first Admin account to initialize secure access for the system.'}
          </p>

          {errorMessage && (
            <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {errorMessage}
            </div>
          )}

          {hasCredentials ? (
            <form action={loginAction} className="mt-6 space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Email</span>
                <input name="email" type="email" required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Password</span>
                <input name="password" type="password" required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
              </label>
              <button type="submit" className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-medium text-slate-950">
                Sign In
              </button>
            </form>
          ) : (
            <form action={setupInitialAdminAction} className="mt-6 space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Admin Name</span>
                <input name="name" defaultValue="Admin User" required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Admin Email</span>
                <input name="email" type="email" required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Password</span>
                <input name="password" type="password" minLength={10} required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Confirm Password</span>
                <input name="confirmPassword" type="password" minLength={10} required className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
              </label>
              <button type="submit" className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-medium text-slate-950">
                Create Admin Account
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
