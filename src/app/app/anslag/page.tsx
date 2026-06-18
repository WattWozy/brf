import { requireSession } from "@/app/lib/auth";
import { ActionForm } from "@/app/components/action-form";
import { Card, EmptyState, Field, PageHeader } from "@/app/components/ui";
import { addDocumentAction, createPostAction } from "@/app/actions/noticeboard";
import { DeletePostButton } from "./delete-post-button";
import { listDocuments, listPosts } from "@/core/usecases/noticeboard";
import { getContext } from "@/infra/container";

export default async function NoticeboardPage() {
  const principal = await requireSession();
  const ctx = getContext();
  const isBoard = principal.role === "STYRELSE";

  const [posts, documents, users] = await Promise.all([
    listPosts(ctx, principal),
    listDocuments(ctx, principal),
    ctx.users.listByBrf(principal.brfId),
  ]);
  const nameById = new Map(users.map((u) => [u.id, u.name]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Anslagstavla"
        description="Nyheter från styrelsen och föreningens dokument."
      />

      {isBoard && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <h2 className="mb-3 text-lg font-semibold">Nytt anslag</h2>
            <ActionForm action={createPostAction} submitLabel="Publicera">
              <Field label="Rubrik" name="title" required />
              <Field label="Text" name="body" required textarea />
              <Field label="Gäller till (valfritt)" name="endDate" type="date" />
            </ActionForm>
          </Card>
          <Card>
            <h2 className="mb-3 text-lg font-semibold">Lägg till dokument</h2>
            <ActionForm
              action={addDocumentAction}
              submitLabel="Lägg till"
              variant="secondary"
            >
              <Field label="Titel" name="title" required placeholder="Årsredovisning 2025" />
              <Field label="Länk (URL) (t.ex Google Drive länk)" name="url" type="url" required placeholder="https://…" />
            </ActionForm>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-3 md:col-span-2">
          <h2 className="text-lg font-semibold">Anslag</h2>
          {posts.length === 0 ? (
            <EmptyState>Inga anslag ännu.</EmptyState>
          ) : (
            posts.map((post) => (
              <Card key={post.id}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium">{post.title}</h3>
                  {isBoard && <DeletePostButton postId={post.id} />}
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                  {post.body}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {nameById.get(post.authorId) ?? "Styrelsen"} ·{" "}
                  {post.createdAt.toLocaleDateString("sv-SE")}
                  {post.endDate && (
                    <> · Gäller till {post.endDate.toLocaleDateString("sv-SE")}</>
                  )}
                </p>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Dokument</h2>
          {documents.length === 0 ? (
            <EmptyState>Inga dokument.</EmptyState>
          ) : (
            <Card>
              <ul className="space-y-2 text-sm">
                {documents.map((doc) => (
                  <li key={doc.id}>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-900 underline hover:text-slate-600"
                    >
                      {doc.title}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
