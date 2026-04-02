import { Database, RotateCcw, Download } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { requireRole } from "@/lib/auth";
import { resetCloudflareDemoDataAction, seedCloudflareDemoDataAction } from "@/lib/cloudflare-admin-actions";

export const dynamic = "force-dynamic";

export default async function CloudflareAdminDataPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const session = await requireRole(["Admin"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Admin Data Tools</h1>
        <p className="mt-2 text-sm text-slate-400">
          Signed in as {session.user.name}. Use these controls to seed or reset starter data in Cloudflare D1.
        </p>
      </div>

      {params.status && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {params.status === "seeded" ? "Starter data seeded into D1." : "D1 data reset and starter data restored."}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Seed starter data" description="Adds the demo properties, companies, users, vehicles, photos, and activity if they do not already exist.">
          <form action={seedCloudflareDemoDataAction}>
            <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-medium text-slate-950">
              <Download className="h-4 w-4" />
              Seed Demo Data
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Reset demo dataset" description="Clears the current D1 records used by the demo app, then reloads the starter dataset.">
          <form action={resetCloudflareDemoDataAction}>
            <button type="submit" className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-3 text-sm font-medium text-rose-200">
              <RotateCcw className="h-4 w-4" />
              Reset Demo Data
            </button>
          </form>
        </SectionCard>
      </div>

      <SectionCard title="What this affects" description="These actions operate on the Cloudflare D1-backed app data used by the main live routes.">
        <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300">
          <Database className="mt-0.5 h-4 w-4 text-slate-500" />
          <p>
            The main routed app views for dashboard, vehicles, and tow requests read from the Cloudflare D1-backed path.
            Seeding or resetting here updates what those routes will show.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
