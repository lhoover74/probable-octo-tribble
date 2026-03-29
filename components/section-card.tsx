import { ReactNode } from "react";

export function SectionCard({
  title,
  description,
  children
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/85 p-5 shadow-soft">
      {(title || description) && (
        <header className="mb-4">
          {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
          {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
