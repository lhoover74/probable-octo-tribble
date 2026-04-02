import Link from "next/link";
import { Shield, Camera, Clock3, Truck as TowTruck } from "lucide-react";
import { users } from "@/lib/mock-data";
import { genericLoginAction } from "@/lib/session-actions";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 shadow-soft lg:p-12">
          <div className="inline-flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-300">
            <TowTruck className="h-4 w-4 text-emerald-300" />
            TowTrack Web
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Tow tracking built as a website for real field use.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Open it in a mobile browser, document vehicles fast, move cases through tow status, and preserve a full audit trail.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Camera,
                title: "Camera intake",
                detail: "Plate and VIN scan flow placeholders with review and correction."
              },
              {
                icon: Clock3,
                title: "Status workflow",
                detail: "Observed through tow completion with time-stamped history."
              },
              {
                icon: Shield,
                title: "Review-ready",
                detail: "Notes, photos, and activity preserved for management and legal review."
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
          <h2 className="text-2xl font-semibold text-white">Sign in</h2>
          <p className="mt-2 text-sm text-slate-400">Use the generic login below or tap a demo user to open the app with a preset role.</p>

          <form action={genericLoginAction} className="mt-6 space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Name</span>
              <input name="userName" defaultValue="Admin User" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Email</span>
              <input name="userEmail" type="email" placeholder="you@example.com" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Role</span>
              <select name="role" defaultValue="Admin" className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white">
                {['Admin', 'Manager', 'Officer/Staff', 'Viewer'].map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>
            <button type="submit" className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-medium text-slate-950">
              Continue with Generic Login
            </button>
          </form>

          <div className="mt-6">
            <p className="text-sm text-slate-400">Or choose a demo user:</p>
            <div className="mt-3 space-y-3">
              {users.map((user) => (
                <Link
                  key={user.id}
                  href={`/auth/demo/${user.id}`}
                  className="block rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition hover:border-slate-700 hover:bg-slate-950"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="mt-1 text-sm text-slate-400">{user.email}</p>
                    </div>
                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">{user.role}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
