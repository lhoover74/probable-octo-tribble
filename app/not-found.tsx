import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="max-w-lg rounded-[2rem] border border-slate-800 bg-slate-900/85 p-8 text-center shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">404</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          The page you requested does not exist in this TowTrack website build or the record link is invalid.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
            Back to sign in
          </Link>
          <Link href="/dashboard" className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-medium text-slate-950">
            Open dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
