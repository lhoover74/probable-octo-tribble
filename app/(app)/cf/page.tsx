import Link from "next/link";
import { SectionCard } from "@/components/section-card";

export default function CloudflareWorkspacePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Cloudflare D1 Workspace</h1>
        <p className="mt-2 text-sm text-slate-400">
          These routes use Cloudflare Workers bindings through OpenNext and query D1 instead of local JSON or node:sqlite.
        </p>
      </div>

      <SectionCard title="Cloudflare routes" description="Use these pages when running with Wrangler or on Cloudflare Workers.">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["/cf/dashboard", "Cloudflare dashboard"],
            ["/cf/vehicles", "Cloudflare vehicle records"],
            ["/cf/vehicles/new", "Cloudflare add vehicle form"],
            ["/cf/tow-requests", "Cloudflare tow queue"],
            ["/api/cf-vehicles", "Cloudflare vehicles API"]
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-4 text-sm text-slate-200 transition hover:border-slate-700"
            >
              <p className="font-medium text-white">{label}</p>
              <p className="mt-1 text-xs text-slate-500">{href}</p>
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
