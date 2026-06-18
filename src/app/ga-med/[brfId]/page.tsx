import { notFound, redirect } from "next/navigation";
import { joinBrfAction } from "@/app/actions/auth";
import { ActionForm } from "@/app/components/action-form";
import { Field } from "@/app/components/ui";
import { getContext } from "@/infra/container";
import { getSession } from "@/infra/auth/session";

export default async function JoinPage({
  params,
}: PageProps<"/ga-med/[brfId]">) {
  if (await getSession()) {
    redirect("/app");
  }
  const { brfId } = await params;
  const brf = await getContext().brfs.findById(brfId);
  if (!brf) {
    notFound();
  }
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">
          Gå med i {brf.name}
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          Skapa ett konto som boende i föreningen.
        </p>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <ActionForm action={joinBrfAction} submitLabel="Skapa konto">
            <input type="hidden" name="brfId" value={brf.id} />
            <Field label="Ditt namn" name="name" required />
            <Field label="Lägenhet (valfritt)" name="apartment" placeholder="1201" />
            <Field label="E-post" name="email" type="email" required />
            <Field label="Lösenord (minst 8 tecken)" name="password" type="password" required />
          </ActionForm>
        </div>
      </div>
    </div>
  );
}
