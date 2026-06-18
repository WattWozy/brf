import { ActionForm } from "@/app/components/action-form";
import { Card, Field, PageHeader } from "@/app/components/ui";
import { registerBusinessAction } from "@/app/actions/businesses";
import Link from "next/link";

export default function BusinessRegisterPage() {
  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="Registrera företag"
        description="Skapa ett konto för att se och lägga bud på uppdrag."
      />
      <Card>
        <ActionForm action={registerBusinessAction} submitLabel="Skapa konto">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Företagsnamn" name="companyName" required placeholder="AB Bygg & Co" />
            <Field label="Organisationsnummer" name="orgNumber" placeholder="556123-4567" />
          </div>
          <Field label="Kontaktperson" name="contactName" required placeholder="Anna Andersson" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="E-post" name="email" type="email" required />
            <Field label="Telefon" name="phone" placeholder="070-000 00 00" />
          </div>
          <Field label="Lösenord" name="password" type="password" required />
          <Field
            label="Beskrivning (valfritt)"
            name="description"
            textarea
            placeholder="Kort beskrivning av vad ni erbjuder …"
          />
        </ActionForm>
      </Card>
      <p className="mt-4 text-center text-sm text-slate-500">
        Har ni redan ett konto?{" "}
        <Link href="/foretag/logga-in" className="font-medium text-slate-900 underline">
          Logga in
        </Link>
      </p>
    </div>
  );
}
