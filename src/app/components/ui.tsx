import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export const CATEGORY_LABELS: Record<string, string> = {
  HANTVERK: "Hantverk",
  RORMOKARARBETE: "Rörmokeri",
  RENOVERING: "Renovering",
  EL: "El",
  TRADGARD: "Trädgård",
  BASTU: "Bastu",
  NATVERK: "Nätverk",
  ANNAT: "Annat",
};

export const PRIORITY_STYLES: Record<string, string> = {
  LAG: "bg-slate-100 text-slate-600",
  MEDEL: "bg-amber-100 text-amber-800",
  HOG: "bg-red-100 text-red-800",
};

export const PRIORITY_LABELS: Record<string, string> = {
  LAG: "Låg prio",
  MEDEL: "Medel prio",
  HOG: "Hög prio",
};

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        PRIORITY_STYLES[priority] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {PRIORITY_LABELS[priority] ?? priority}
    </span>
  );
}

const STATUS_STYLES: Record<string, string> = {
  INKOMMEN: "bg-amber-100 text-amber-800",
  TRIAGE: "bg-blue-100 text-blue-800",
  AVFARDAD: "bg-slate-100 text-slate-600",
  ATGARDAD: "bg-emerald-100 text-emerald-800",
  UTKAST: "bg-slate-100 text-slate-600",
  PUBLICERAT: "bg-blue-100 text-blue-800",
  TILLDELAT: "bg-violet-100 text-violet-800",
  PAGAR: "bg-amber-100 text-amber-800",
  KLART: "bg-emerald-100 text-emerald-800",
};

const STATUS_LABELS: Record<string, string> = {
  INKOMMEN: "Inkommen",
  TRIAGE: "Under hantering",
  AVFARDAD: "Avfärdad",
  ATGARDAD: "Åtgärdad",
  UTKAST: "Utkast",
  PUBLICERAT: "Publicerat",
  TILLDELAT: "Tilldelat",
  PAGAR: "Pågår",
  KLART: "Klart",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
      {children}
    </p>
  );
}

export function Select({
  label,
  name,
  required = false,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  const cls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 bg-white";
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <select name={name} required={required} defaultValue={defaultValue} className={cls}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  defaultValue,
  textarea = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  textarea?: boolean;
}) {
  const cls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900";
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {textarea ? (
        <textarea
          name={name}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue}
          rows={4}
          className={cls}
        />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className={cls}
        />
      )}
    </label>
  );
}
