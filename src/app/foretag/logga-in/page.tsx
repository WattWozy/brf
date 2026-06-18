import { ActionForm } from "@/app/components/action-form";
import { Card, Field, PageHeader } from "@/app/components/ui";
import { loginBusinessAction } from "@/app/actions/businesses";
import Link from "next/link";

export default function BusinessLoginPage() {
  return (
    <div className="mx-auto max-w-sm">
      <PageHeader title="Logga in" description="Företagsportalen för hantverkare." />
      <Card>
        <ActionForm action={loginBusinessAction} submitLabel="Logga in">
          <Field label="E-post" name="email" type="email" required />
          <Field label="Lösenord" name="password" type="password" required />
        </ActionForm>
      </Card>
      <p className="mt-4 text-center text-sm text-slate-500">
        Inget konto?{" "}
        <Link href="/foretag/registrera" className="font-medium text-slate-900 underline">
          Registrera er här
        </Link>
      </p>
    </div>
  );
}
