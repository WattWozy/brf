import Link from "next/link";
import { requireSession } from "@/app/lib/auth";
import { getBaseUrl } from "@/app/lib/url";
import { Card, PageHeader } from "@/app/components/ui";
import { CopyLink } from "@/app/components/copy-link";
import { getContext } from "@/infra/container";
import { listIssues } from "@/core/usecases/issues";
import { listPosts } from "@/core/usecases/noticeboard";

export default async function DashboardPage() {
  const principal = await requireSession();
  const ctx = getContext();
  const isBoard = principal.role === "STYRELSE";

  const [issues, posts] = await Promise.all([
    listIssues(ctx, principal),
    listPosts(ctx, principal),
  ]);
  const openIssues = issues.filter(
    (i) => i.status === "INKOMMEN" || i.status === "TRIAGE",
  ).length;
  const baseUrl = await getBaseUrl();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hej${isBoard ? ", styrelsen" : ""}!`}
        description="Här är en överblick av föreningen."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Öppna felanmälningar</p>
          <p className="mt-1 text-3xl font-semibold">{openIssues}</p>
          <Link href="/app/felanmalan" className="mt-2 inline-block text-sm text-slate-900 underline">
            Visa alla
          </Link>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Anslag</p>
          <p className="mt-1 text-3xl font-semibold">{posts.length}</p>
          <Link href="/app/anslag" className="mt-2 inline-block text-sm text-slate-900 underline">
            Till anslagstavlan
          </Link>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Felanmälningar totalt</p>
          <p className="mt-1 text-3xl font-semibold">{issues.length}</p>
        </Card>
      </div>

      {isBoard && (
        <Card>
          <h2 className="text-lg font-semibold">Bjud in boende</h2>
          <p className="mb-3 mt-1 text-sm text-slate-500">
            Dela den här länken med era medlemmar så kan de skapa konton.
          </p>
          <CopyLink url={`${baseUrl}/ga-med/${principal.brfId}`} />
        </Card>
      )}

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Senaste anslag</h2>
        {posts.length === 0 ? (
          <p className="text-sm text-slate-500">Inga anslag ännu.</p>
        ) : (
          <ul className="space-y-3">
            {posts.slice(0, 3).map((p) => (
              <li key={p.id} className="border-b border-slate-100 pb-3 last:border-0">
                <p className="font-medium">{p.title}</p>
                <p className="text-sm text-slate-600">{p.body}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
