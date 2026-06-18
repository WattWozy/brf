import { notFound } from "next/navigation";
import { requireBusiness } from "@/app/lib/business-auth";
import { getPublishedJob } from "@/core/usecases/jobs";
import { getContext } from "@/infra/container";
import { NotFoundError } from "@/core/domain/errors";
import { ActionForm } from "@/app/components/action-form";
import { Card, CATEGORY_LABELS, Field, PageHeader, PriorityBadge } from "@/app/components/ui";
import { submitBidAsBusinessAction } from "@/app/actions/businesses";
import Link from "next/link";

export default async function BusinessJobDetailPage({
  params,
}: PageProps<"/foretag/uppdrag/[jobId]">) {
  const principal = await requireBusiness();
  const { jobId } = await params;

  let job;
  try {
    job = await getPublishedJob(getContext(), jobId);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }

  const brfName = (await getContext().brfs.findById(job.brfId))?.name ?? "Förening";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/foretag/uppdrag" className="text-sm text-slate-500 hover:text-slate-900">
          ← Tillbaka till uppdragspool
        </Link>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{job.title}</h1>
          <PriorityBadge priority={job.priority} />
        </div>
        <p className="mt-0.5 text-sm text-slate-400">
          {brfName} · {CATEGORY_LABELS[job.category] ?? job.category}
          {job.deadline && ` · Deadline: ${job.deadline.toLocaleDateString("sv-SE")}`}
        </p>
      </div>

      <Card>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Beskrivning
        </h2>
        <p className="whitespace-pre-wrap text-sm text-slate-700">{job.description}</p>
      </Card>

      <Card>
        <h2 className="mb-1 text-lg font-semibold">Lägg bud</h2>
        <p className="mb-4 text-sm text-slate-500">
          Uppgifterna är förfyllda från ert företagskonto. Justera vid behov.
        </p>
        <ActionForm
          action={submitBidAsBusinessAction}
          submitLabel="Skicka bud"
          successMessage="Ert bud har skickats till föreningen!"
        >
          <input type="hidden" name="jobId" value={job.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Företag"
              name="companyName"
              required
              defaultValue={principal.companyName}
            />
            <Field
              label="Kontaktperson"
              name="contactName"
              required
              defaultValue={principal.contactName}
            />
            <Field
              label="E-post"
              name="contactEmail"
              type="email"
              required
              defaultValue={principal.email}
            />
            <Field
              label="Telefon"
              name="contactPhone"
              defaultValue={principal.phone ?? ""}
            />
            <Field label="Pris (kr, exkl. moms)" name="priceSek" type="number" required />
            <Field label="Uppskattad tid (dagar)" name="estimatedDays" type="number" />
          </div>
          <Field
            label="Meddelande"
            name="message"
            textarea
            placeholder="Beskriv ert upplägg, referensprojekt, garantier m.m."
          />
        </ActionForm>
      </Card>
    </div>
  );
}
