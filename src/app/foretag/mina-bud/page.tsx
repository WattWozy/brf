import { requireBusiness } from "@/app/lib/business-auth";
import { listMyBids } from "@/core/usecases/bids";
import { getContext } from "@/infra/container";
import { deleteBidAction } from "@/app/actions/businesses";
import { Card, EmptyState, PageHeader } from "@/app/components/ui";
import { InlineAction } from "@/app/components/inline-action";
import type { BidWithJob } from "@/core/ports/repositories";

const kr = (n: number) => `${n.toLocaleString("sv-SE")} kr`;

function bidStatus(bid: BidWithJob): { label: string; cls: string } {
  if (bid.jobAwardedBidId === bid.id) {
    return { label: "Accepterat", cls: "bg-emerald-100 text-emerald-800" };
  }
  if (
    bid.jobAwardedBidId !== null ||
    bid.jobStatus === "KLART" ||
    bid.jobStatus === "PAGAR" ||
    bid.jobStatus === "TILLDELAT"
  ) {
    return { label: "Ej vald", cls: "bg-slate-100 text-slate-500" };
  }
  return { label: "Inväntar svar", cls: "bg-amber-100 text-amber-800" };
}

export default async function MinaBudPage() {
  const principal = await requireBusiness();
  const bids = await listMyBids(getContext(), principal);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mina bud"
        description="Bud ni har skickat in och deras status."
      />

      {bids.length === 0 ? (
        <EmptyState>Ni har inte lagt några bud ännu.</EmptyState>
      ) : (
        <div className="space-y-3">
          {bids.map((bid) => {
            const { label, cls } = bidStatus(bid);
            const canDelete = bid.jobAwardedBidId !== bid.id;
            return (
              <Card key={bid.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-slate-900">{bid.jobTitle}</h3>
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
                      >
                        {label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Skickat {bid.createdAt.toLocaleDateString("sv-SE")}
                    </p>
                    {bid.message && (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{bid.message}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-semibold text-slate-900">{kr(bid.priceSek)}</p>
                    {bid.estimatedDays && (
                      <p className="text-xs text-slate-500">~{bid.estimatedDays} dagar</p>
                    )}
                  </div>
                </div>
                {canDelete && (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <InlineAction
                      action={deleteBidAction}
                      label="Ta bort bud"
                      variant="danger"
                      confirm={`Ta bort budet på "${bid.jobTitle}"? Det går inte att ångra.`}
                      hidden={{ bidId: bid.id }}
                    />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
