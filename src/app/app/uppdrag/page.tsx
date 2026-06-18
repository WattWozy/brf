import Link from "next/link";
import { requireBoard } from "@/app/lib/auth";
import { ActionForm } from "@/app/components/action-form";
import {
  Card,
  CATEGORY_LABELS,
  EmptyState,
  Field,
  PageHeader,
  PriorityBadge,
  Select,
  StatusBadge,
} from "@/app/components/ui";
import { createJobAction } from "@/app/actions/jobs";
import { listJobs } from "@/core/usecases/jobs";
import { getContext } from "@/infra/container";

export default async function JobsPage() {
  const principal = await requireBoard();
  const jobs = await listJobs(getContext(), principal);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Uppdrag"
        description="Skapa uppdrag och låt hantverkare lägga bud via en delningslänk."
      />

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Nytt uppdrag</h2>
        <ActionForm action={createJobAction} submitLabel="Skapa uppdrag">
          <Field label="Titel" name="title" required placeholder="Måla om trapphus" />
          <Field label="Beskrivning" name="description" required textarea placeholder="Omfattning, material, önskemål …" />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Kategori"
              name="category"
              required
              defaultValue="ANNAT"
              options={[
                { value: "HANTVERK", label: "Hantverk" },
                { value: "RORMOKARARBETE", label: "Rörmokeri" },
                { value: "RENOVERING", label: "Renovering" },
                { value: "EL", label: "El" },
                { value: "TRADGARD", label: "Trädgård" },
                { value: "BASTU", label: "Bastu" },
                { value: "NATVERK", label: "Nätverk" },
                { value: "ANNAT", label: "Annat" },
              ]}
            />
            <Select
              label="Prioritet"
              name="priority"
              required
              defaultValue="MEDEL"
              options={[
                { value: "LAG", label: "Låg" },
                { value: "MEDEL", label: "Medel" },
                { value: "HOG", label: "Hög" },
              ]}
            />
          </div>
          <Field label="Deadline (valfritt)" name="deadline" type="date" />
        </ActionForm>
      </Card>

      <div className="space-y-3">
        {jobs.length === 0 ? (
          <EmptyState>Inga uppdrag ännu.</EmptyState>
        ) : (
          jobs.map((job) => (
            <Link key={job.id} href={`/app/uppdrag/${job.id}`} className="block">
              <Card className="transition hover:border-slate-400">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{job.title}</h3>
                      <StatusBadge status={job.status} />
                      <PriorityBadge priority={job.priority} />
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-slate-600">
                      {CATEGORY_LABELS[job.category] ?? job.category} · {job.description}
                    </p>
                  </div>
                  <span className="text-sm text-slate-400">Visa →</span>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
