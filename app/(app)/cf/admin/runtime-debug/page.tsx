import { getCloudflareContext } from "@opennextjs/cloudflare";
import { SectionCard } from "@/components/section-card";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

type DebugEnv = {
  APP_BASE_URL?: string;
  EMAIL_FROM?: string;
  EMAIL_REPLY_TO?: string;
  RESEND_API_KEY?: string;
};

function isPresent(value?: string) {
  return Boolean((value || "").trim());
}

function formatValue(value?: string) {
  const normalized = (value || "").trim();
  return normalized || "Missing";
}

export default async function RuntimeDebugPage() {
  await requireRole(["Admin"]);
  const { env } = getCloudflareContext();
  const runtime = env as DebugEnv;

  const rows = [
    {
      name: "APP_BASE_URL",
      present: isPresent(runtime.APP_BASE_URL),
      value: formatValue(runtime.APP_BASE_URL),
      note: "Must be your TowTrack site URL."
    },
    {
      name: "EMAIL_FROM",
      present: isPresent(runtime.EMAIL_FROM),
      value: formatValue(runtime.EMAIL_FROM),
      note: "Must be a sender Resend accepts."
    },
    {
      name: "EMAIL_REPLY_TO",
      present: isPresent(runtime.EMAIL_REPLY_TO),
      value: formatValue(runtime.EMAIL_REPLY_TO),
      note: "Optional."
    },
    {
      name: "RESEND_API_KEY",
      present: isPresent(runtime.RESEND_API_KEY),
      value: isPresent(runtime.RESEND_API_KEY) ? "Present" : "Missing",
      note: "Secret value is intentionally hidden."
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Runtime Debug</h1>
        <p className="mt-2 text-sm text-slate-400">Admin-only runtime check for Worker email settings.</p>
      </div>

      <SectionCard title="Email runtime environment" description="This page reads the live Worker runtime values without exposing secret contents.">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Setting</th>
                <th className="px-4 py-3 font-medium">Present</th>
                <th className="px-4 py-3 font-medium">Runtime Value</th>
                <th className="px-4 py-3 font-medium">Note</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name} className="border-t border-slate-800 align-top">
                  <td className="px-4 py-4 font-medium text-white">{row.name}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full border px-3 py-1 text-xs ${row.present ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-rose-500/30 bg-rose-500/10 text-rose-200'}`}>
                      {row.present ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-300 break-all">{row.value}</td>
                  <td className="px-4 py-4 text-slate-500">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
