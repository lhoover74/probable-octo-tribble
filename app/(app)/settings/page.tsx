import { SectionCard } from "@/components/section-card";

const settings = [
  ["Notifications", "Send alerts for vehicle marked for tow, tow requested, and tow completed."],
  ["Photo required before tow", "Prevent tow request until minimum evidence has been uploaded."],
  ["Duplicate vehicle detection", "Check plate and VIN against prior warnings, tows, and watchlist history."],
  ["GPS capture", "Store device location on intake and evidence uploads when enabled."]
];

export default function SettingsPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <SectionCard title="Operational settings" description="Behavior toggles for notifications, evidence rules, and intake workflow.">
        <div className="space-y-4">
          {settings.map(([title, detail], index) => (
            <div key={title} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <div>
                <p className="font-medium text-white">{title}</p>
                <p className="mt-1 text-sm text-slate-400">{detail}</p>
              </div>
              <div className={`relative h-7 w-14 rounded-full ${index < 3 ? "bg-emerald-500" : "bg-slate-700"}`}>
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white ${index < 3 ? "left-8" : "left-1"}`} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="System behavior rules" description="High-level guardrails for accountability and record preservation.">
        <div className="space-y-4 text-sm text-slate-300">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
            <p className="font-medium text-white">Audit trail protection</p>
            <p className="mt-2 text-slate-400">Status changes, uploads, edits, and notes append to history instead of overwriting major events.</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
            <p className="font-medium text-white">Protected routes</p>
            <p className="mt-2 text-slate-400">UI actions are role aware. Viewer accounts can inspect but cannot change records.</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
            <p className="font-medium text-white">Validation model</p>
            <p className="mt-2 text-slate-400">Core intake fields keep entry fast while preserving legally useful details for downstream reporting.</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
