import { requireSession } from "@/app/lib/auth";
import { ActionForm } from "@/app/components/action-form";
import { Card, EmptyState, Field, PageHeader } from "@/app/components/ui";
import { bookAction, createResourceAction } from "@/app/actions/bookings";
import { listBookings, listResources } from "@/core/usecases/bookings";
import { getContext } from "@/infra/container";

const fmt = (d: Date) =>
  d.toLocaleString("sv-SE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default async function BookingsPage() {
  const principal = await requireSession();
  const ctx = getContext();
  const isBoard = principal.role === "STYRELSE";

  const resources = await listResources(ctx, principal);
  const bookingsByResource = await Promise.all(
    resources.map((r) => listBookings(ctx, principal, r.id)),
  );
  const now = new Date();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bokningar"
        description="Boka tvättstuga, gästlägenhet och gemensamma utrymmen."
      />

      {isBoard && (
        <Card>
          <h2 className="mb-3 text-lg font-semibold">Ny resurs</h2>
          <ActionForm action={createResourceAction} submitLabel="Lägg till resurs">
            <Field label="Namn" name="name" required placeholder="Tvättstuga 1" />
          </ActionForm>
        </Card>
      )}

      {resources.length === 0 ? (
        <EmptyState>
          Inga bokningsbara resurser ännu.
          {isBoard ? " Lägg till en ovan." : " Styrelsen lägger till dem."}
        </EmptyState>
      ) : (
        resources.map((resource, i) => {
          const upcoming = bookingsByResource[i].filter((b) => b.endTime >= now);
          return (
            <Card key={resource.id}>
              <h2 className="text-lg font-semibold">{resource.name}</h2>

              <div className="mt-3 grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-slate-700">
                    Kommande bokningar
                  </h3>
                  {upcoming.length === 0 ? (
                    <p className="text-sm text-slate-500">Inga bokningar.</p>
                  ) : (
                    <ul className="space-y-1 text-sm text-slate-600">
                      {upcoming.map((b) => (
                        <li key={b.id} className="rounded bg-slate-50 px-3 py-1.5">
                          {fmt(b.startTime)} – {fmt(b.endTime)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium text-slate-700">
                    Boka en tid
                  </h3>
                  <ActionForm action={bookAction} submitLabel="Boka" variant="secondary">
                    <input type="hidden" name="resourceId" value={resource.id} />
                    <Field label="Från" name="startTime" type="datetime-local" required />
                    <Field label="Till" name="endTime" type="datetime-local" required />
                  </ActionForm>
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
