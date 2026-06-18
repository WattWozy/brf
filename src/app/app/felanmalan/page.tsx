import { requireSession } from "@/app/lib/auth";
import { ActionForm } from "@/app/components/action-form";
import { InlineAction } from "@/app/components/inline-action";
import { Card, EmptyState, Field, PageHeader, Select, StatusBadge } from "@/app/components/ui";
import { reportIssueAction, setIssueStatusAction } from "@/app/actions/issues";
import { createAndPublishJobAction } from "@/app/actions/jobs";
import { confirmBidAction } from "@/app/actions/bids";
import { listIssues } from "@/core/usecases/issues";
import { getContext } from "@/infra/container";
import type { Bid, Issue, Job } from "@/core/domain/entities";

const kr = (n: number) => `${n.toLocaleString("sv-SE")} kr`;

export default async function IssuesPage() {
  const principal = await requireSession();
  const ctx = getContext();
  const isBoard = principal.role === "STYRELSE";

  const [issues, users] = await Promise.all([
    listIssues(ctx, principal),
    ctx.users.listByBrf(principal.brfId),
  ]);
  const nameById = new Map(users.map((u) => [u.id, u.name]));

  // For issues authored by the current user that are in TRIAGE (linked to a job),
  // fetch the job and its bids so the author can see and confirm them.
  const myTriageIssues = issues.filter(
    (i) => i.authorId === principal.userId && i.status === "TRIAGE",
  );
  const jobAndBidsEntries = await Promise.all(
    myTriageIssues.map(async (issue) => {
      const job = await ctx.jobs.findByIssueId(issue.id);
      if (!job) return [issue.id, null] as const;
      const bids = await ctx.bids.listByJob(job.id);
      return [issue.id, { job, bids }] as const;
    }),
  );
  const issueJobMap = new Map<string, { job: Job; bids: Bid[] } | null>(
    jobAndBidsEntries,
  );

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
          issues.map((issue) => {
            const jobData = issueJobMap.get(issue.id) ?? null;
            return (
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

                {/* Board actions */}
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
                    {issue.status !== "TRIAGE" && (
                      <div className="w-full pt-1">
                        <ActionForm
                          action={createAndPublishJobAction}
                          submitLabel="Publicera till företagsportalen →"
                          variant="primary"
                        >
                          <input type="hidden" name="issueId" value={issue.id} />
                          <input type="hidden" name="title" value={issue.title} />
                          <input type="hidden" name="description" value={issue.description} />
                          <div className="grid grid-cols-2 gap-2">
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
                        </ActionForm>
                      </div>
                    )}
                  </div>
                )}

                {/* Bid panel — shown to the issue author once bids exist */}
                {jobData && jobData.bids.length > 0 && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <h4 className="mb-2 text-sm font-semibold text-slate-700">
                      Inkomna bud ({jobData.bids.length})
                    </h4>
                    <div className="space-y-2">
                      {jobData.bids.map((bid) => {
                        const won = jobData.job.awardedBidId === bid.id;
                        return (
                          <div
                            key={bid.id}
                            className={`rounded-lg border p-3 ${
                              won
                                ? "border-emerald-300 bg-emerald-50"
                                : "border-slate-200 bg-slate-50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{bid.companyName}</span>
                                  {won && (
                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                                      Godkänt
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500">
                                  {bid.contactName} · {bid.contactEmail}
                                  {bid.contactPhone && ` · ${bid.contactPhone}`}
                                </p>
                                {bid.message && (
                                  <p className="mt-1 text-xs text-slate-600">{bid.message}</p>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-semibold text-slate-900">{kr(bid.priceSek)}</p>
                                {bid.estimatedDays && (
                                  <p className="text-xs text-slate-500">~{bid.estimatedDays} dagar</p>
                                )}
                              </div>
                            </div>
                            {!won && jobData.job.status === "PUBLICERAT" && (
                              <div className="mt-2 border-t border-slate-200 pt-2">
                                <InlineAction
                                  action={confirmBidAction}
                                  label="Godkänn detta bud"
                                  variant="primary"
                                  confirm={`Godkänn budet från ${bid.companyName} för ${kr(bid.priceSek)}?`}
                                  hidden={{ issueId: issue.id, bidId: bid.id }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Prompt author when job is published but no bids yet */}
                {jobData && jobData.bids.length === 0 && jobData.job.status === "PUBLICERAT" && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="text-sm text-slate-500">
                      Uppdraget är publicerat — väntar på bud från hantverkare.
                    </p>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
