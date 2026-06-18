import { requireSession } from "@/app/lib/auth";
import { ActionForm } from "@/app/components/action-form";
import { InlineAction } from "@/app/components/inline-action";
import { Card, EmptyState, Field, PageHeader, StatusBadge } from "@/app/components/ui";
import { reportIssueAction, setIssueStatusAction } from "@/app/actions/issues";
import { createJobAction } from "@/app/actions/jobs";
import { listIssues } from "@/core/usecases/issues";
import { getContext } from "@/infra/container";

export default async function IssuesPage() {
  const principal = await requireSession();
  const ctx = getContext();
  const isBoard = principal.role === "STYRELSE";

  const [issues, users] = await Promise.all([
    listIssues(ctx, principal),
    ctx.users.listByBrf(principal.brfId),
  ]);
  const nameById = new Map(users.map((u) => [u.id, u.name]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Felanmälan"
        description="Rapportera fel i fastigheten. Styrelsen hanterar och kan skapa uppdrag."
      />

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Ny felanmälan</h2>
        <ActionForm action={reportIssueAction} submitLabel="Skicka in">
          <Field label="Vad gäller det?" name="title" required placeholder="Trasig lampa i trapphus" />
          <Field label="Var?" name="location" placeholder="Trapphus B, plan 3" />
          <Field label="Beskrivning" name="description" required textarea />
        </ActionForm>
      </Card>

      <div className="space-y-3">
        {issues.length === 0 ? (
          <EmptyState>Inga felanmälningar ännu.</EmptyState>
        ) : (
          issues.map((issue) => (
            <Card key={issue.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{issue.title}</h3>
                    <StatusBadge status={issue.status} />
                  </div>
                  {issue.location && (
                    <p className="text-sm text-slate-500">{issue.location}</p>
                  )}
                  <p className="mt-1 text-sm text-slate-600">{issue.description}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Anmäld av {nameById.get(issue.authorId) ?? "okänd"} ·{" "}
                    {issue.createdAt.toLocaleDateString("sv-SE")}
                  </p>
                </div>
              </div>

              {isBoard && issue.status !== "AVFARDAD" && issue.status !== "ATGARDAD" && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                  <InlineAction
                    action={setIssueStatusAction}
                    label="Markera åtgärdad"
                    hidden={{ issueId: issue.id, status: "ATGARDAD" }}
                  />
                  <InlineAction
                    action={setIssueStatusAction}
                    label="Avfärda"
                    variant="danger"
                    hidden={{ issueId: issue.id, status: "AVFARDAD" }}
                  />
                  <InlineAction
                    action={createJobAction}
                    label="Skapa uppdrag →"
                    variant="primary"
                    hidden={{
                      issueId: issue.id,
                      title: issue.title,
                      description: issue.description,
                    }}
                  />
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
