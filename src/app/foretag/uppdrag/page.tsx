import Link from "next/link";
import { requireBusiness } from "@/app/lib/business-auth";
import { listPublishedJobs } from "@/core/usecases/jobs";
import { getContext } from "@/infra/container";
import {
  Card,
  CATEGORY_LABELS,
  EmptyState,
  PageHeader,
  PriorityBadge,
} from "@/app/components/ui";
import type { JobCategory, JobPriority } from "@/core/domain/entities";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "", label: "Alla kategorier" },
  { value: "HANTVERK", label: "Hantverk" },
  { value: "RORMOKARARBETE", label: "Rörmokeri" },
  { value: "RENOVERING", label: "Renovering" },
  { value: "EL", label: "El" },
  { value: "TRADGARD", label: "Trädgård" },
  { value: "BASTU", label: "Bastu" },
  { value: "NATVERK", label: "Nätverk" },
  { value: "ANNAT", label: "Annat" },
];

const PRIORITIES: { value: string; label: string }[] = [
  { value: "", label: "Alla prioriteter" },
  { value: "HOG", label: "Hög" },
  { value: "MEDEL", label: "Medel" },
  { value: "LAG", label: "Låg" },
];

const selectCls =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900";

export default async function BusinessJobsPage({
  searchParams,
}: PageProps<"/foretag/uppdrag">) {
  await requireBusiness();
  const sp = await searchParams;
  const category = (sp.category as JobCategory | undefined) || undefined;
  const priority = (sp.priority as JobPriority | undefined) || undefined;

  const jobs = await listPublishedJobs(getContext(), { category, priority });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Uppdragspool"
        description="Publicerade uppdrag från föreningar i nätverket. Klicka för att lägga bud."
      />

      {/* Filter bar */}
      <form method="GET" className="flex flex-wrap gap-3">
        <select name="category" defaultValue={category ?? ""} className={selectCls}>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select name="priority" defaultValue={priority ?? ""} className={selectCls}>
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Filtrera
        </button>
        {(category || priority) && (
          <Link
            href="/foretag/uppdrag"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Rensa filter
          </Link>
        )}
      </form>

      {jobs.length === 0 ? (
        <EmptyState>Inga publicerade uppdrag matchar filtret.</EmptyState>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link key={job.id} href={`/foretag/uppdrag/${job.id}`} className="block">
              <Card className="transition hover:border-slate-400">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-slate-900">{job.title}</h3>
                      <PriorityBadge priority={job.priority} />
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">{job.brfName}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                      {CATEGORY_LABELS[job.category] ?? job.category} · {job.description}
                    </p>
                    {job.deadline && (
                      <p className="mt-1 text-xs text-slate-400">
                        Deadline: {job.deadline.toLocaleDateString("sv-SE")}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm text-slate-400">Lägg bud →</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
