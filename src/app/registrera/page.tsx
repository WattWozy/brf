import Link from "next/link";
import { redirect } from "next/navigation";
import { registerBrfAction } from "@/app/actions/auth";
import { ActionForm } from "@/app/components/action-form";
import { Field } from "@/app/components/ui";
import { getSession } from "@/infra/auth/session";

export default async function RegisterPage() {
  if (await getSession()) {
    redirect("/app");
  }
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">
          Skapa förening
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          Du blir första styrelseledamoten och kan sedan bjuda in boende.
        </p>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <ActionForm action={registerBrfAction} submitLabel="Skapa förening">
            <Field label="Föreningens namn" name="brfName" required placeholder="Brf Solrosen" />
            <Field label="Organisationsnummer" name="orgNumber" placeholder="769600-0000" />
            <hr className="border-slate-100" />
            <Field label="Ditt namn" name="adminName" required />
            <Field label="Din e-post" name="adminEmail" type="email" required />
            <Field label="Lösenord (minst 8 tecken)" name="password" type="password" required />
          </ActionForm>
        </div>
        <p className="mt-4 text-center text-sm text-slate-500">
          Redan medlem?{" "}
          <Link href="/login" className="font-medium text-slate-900 underline">
            Logga in
          </Link>
        </p>
      </div>
    </div>
  );
}
