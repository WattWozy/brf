import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { ActionForm } from "@/app/components/action-form";
import { Field } from "@/app/components/ui";
import { getSession } from "@/infra/auth/session";

export default async function LoginPage() {
  if (await getSession()) {
    redirect("/app");
  }
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">Logga in</h1>
        <p className="mb-6 text-sm text-slate-500">
          Välkommen tillbaka till Föreningsportalen.
        </p>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <ActionForm action={loginAction} submitLabel="Logga in">
            <Field label="E-post" name="email" type="email" required />
            <Field label="Lösenord" name="password" type="password" required />
          </ActionForm>
        </div>
        <p className="mt-4 text-center text-sm text-slate-500">
          Ingen förening än?{" "}
          <Link href="/registrera" className="font-medium text-slate-900 underline">
            Skapa en
          </Link>
        </p>
      </div>
    </div>
  );
}
