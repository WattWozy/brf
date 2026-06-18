import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBoard } from "@/app/lib/auth";
import { getBaseUrl } from "@/app/lib/url";
import { CopyLink } from "@/app/components/copy-link";
import { InlineAction } from "@/app/components/inline-action";
import { Card, CATEGORY_LABELS, EmptyState, PageHeader, PriorityBadge, StatusBadge } from "@/app/components/ui";
import {
  awardBidAction,
  publishJobAction,
  setJobStatusAction,
} from "@/app/actions/jobs";
import { listBids } from "@/core/usecases/bids";
import { getJob } from "@/core/usecases/jobs";
import { NotFoundError } from "@/core/domain/errors";
import { getContext } from "@/infra/container";

const kr = (n: number) => `${n.toLocaleString("sv-SE")} kr`;

export default async function JobDetailPage({
  params,
}: PageProps<"/app/uppdrag/[id]">) {
  const principal = await requireBoard();
  const { id } = await params;
  const ctx = getContext();

  let job;
  try {
    job = await getJob(ctx, principal, id);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }
  const bids = await listBids(ctx, principal, id);
  const baseUrl = await getBaseUrl();
  const publicUrl = `${baseUrl}/uppdrag/${job.publicToken}`;

  return (
    <div className="space-y-6">
      <Link href="/app/uppdrag" className="text-sm text-slate-500 hover:text-slate-900">
        ← Alla uppdrag
      </Link>

      <PageHeader
        title={job.title}
        action={
          <div className="flex items-center gap-2">
            <PriorityBadge priority={job.priority} />
            <StatusBadge status={job.status} />
          </div>
        }
      />

      <Card>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
          {CATEGORY_LABELS[job.category] ?? job.category}
        </p>
        <p className="whitespace-pre-wrap text-sm text-slate-700">{job.description}</p>
        {job.deadline && (
          <p className="mt-3 text-sm text-slate-500">
            Deadline: {job.deadline.toLocaleDateString("sv-SE")}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {job.status === "UTKAST" && (
            <InlineAction
              action={publishJobAction}
              label="Publicera & öppna för bud"
              variant="primary"
              hidden={{ jobId: job.id }}
            />
          )}
          {job.status === "TILLDELAT" && (
            <InlineAction
              action={setJobStatusAction}
              label="Markera som pågår"
              variant="primary"
              hidden={{ jobId: job.id, status: "PAGAR" }}
            />
          )}
          {(job.status === "PAGAR" || job.status === "TILLDELAT") && (
            <InlineAction
              action={setJobStatusAction}
              label="Markera som klart"
              hidden={{ jobId: job.id, status: "KLART" }}
            />
          )}
        </div>
      </Card>

      {job.status === "PUBLICERAT" && (
        <Card>
          <h2 className="text-lg font-semibold">Delningslänk för hantverkare</h2>
          <p className="mb-3 mt-1 text-sm text-slate-500">
            Skicka länken till hantverkare. De kan lägga bud utan konto.
          </p>
          <CopyLink url={publicUrl} />
        </Card>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold">
          Inkomna bud {bids.length > 0 && `(${bids.length})`}
        </h2>
        {bids.length === 0 ? (
          <EmptyState>
            Inga bud ännu.{" "}
            {job.status === "UTKAST"
              ? "Publicera uppdraget för att ta emot bud."
              : "Dela länken med hantverkare."}
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {bids.map((bid) => {
              const won = job.awardedBidId === bid.id;
              return (
                <Card
                  key={bid.id}
                  className={won ? "border-emerald-400 ring-1 ring-emerald-200" : ""}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{bid.companyName}</h3>
                        {won && <StatusBadge status="TILLDELAT" />}
                      </div>
                      <p className="text-sm text-slate-600">
                        {bid.contactName} · {bid.contactEmail}
                        {bid.contactPhone && ` · ${bid.contactPhone}`}
                      </p>
                      {bid.message && (
                        <p className="mt-2 text-sm text-slate-600">{bid.message}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{kr(bid.priceSek)}</p>
                      {bid.estimatedDays && (
                        <p className="text-xs text-slate-500">
                          ~{bid.estimatedDays} dagar
                        </p>
                      )}
                    </div>
                  </div>
                  {!won && job.status !== "KLART" && (
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <InlineAction
                        action={awardBidAction}
                        label="Tilldela detta bud"
                        variant="primary"
                        confirm={`Tilldela uppdraget till ${bid.companyName} för ${kr(bid.priceSek)}?`}
                        hidden={{ jobId: job.id, bidId: bid.id }}
                      />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
