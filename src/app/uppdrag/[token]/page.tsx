import { notFound } from "next/navigation";
import { submitBidAction } from "@/app/actions/bids";
import { ActionForm } from "@/app/components/action-form";
import { Field } from "@/app/components/ui";
import { getPublicJob } from "@/core/usecases/bids";
import { NotFoundError } from "@/core/domain/errors";
import { getContext } from "@/infra/container";

export default async function PublicBidPage({
  params,
}: PageProps<"/uppdrag/[token]">) {
  const { token } = await params;

  let job;
  try {
    job = await getPublicJob(getContext(), token);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }

  const open = job.status === "PUBLICERAT";

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-2xl px-6 py-4 text-sm font-semibold">
          Föreningsportalen · Offertförfrågan
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">{job.title}</h1>
        {job.deadline && (
          <p className="mt-1 text-sm text-slate-500">
            Önskad deadline: {job.deadline.toLocaleDateString("sv-SE")}
          </p>
        )}
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="whitespace-pre-wrap text-sm text-slate-700">
            {job.description}
          </p>
        </div>

        {open ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-lg font-semibold">Lägg ett bud</h2>
            <p className="mb-4 text-sm text-slate-500">
              Fyll i era uppgifter och ert pris. Styrelsen återkommer till er.
            </p>
            <ActionForm
              action={submitBidAction}
              submitLabel="Skicka bud"
              successMessage="Tack! Ert bud har skickats till föreningen."
            >
              <input type="hidden" name="publicToken" value={token} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Företag" name="companyName" required />
                <Field label="Kontaktperson" name="contactName" required />
                <Field label="E-post" name="contactEmail" type="email" required />
                <Field label="Telefon" name="contactPhone" />
                <Field label="Pris (kr, exkl. moms)" name="priceSek" type="number" required />
                <Field label="Uppskattad tid (dagar)" name="estimatedDays" type="number" />
              </div>
              <Field label="Meddelande" name="message" textarea placeholder="Beskriv ert upplägg, garantier m.m." />
            </ActionForm>
          </div>
        ) : (
          <p className="mt-6 rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            Det här uppdraget tar inte längre emot bud.
          </p>
        )}
      </main>
    </div>
  );
}
