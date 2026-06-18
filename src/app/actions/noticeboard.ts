"use server";

import { revalidatePath } from "next/cache";
import { addDocument, createPost, deletePost } from "@/core/usecases/noticeboard";
import { getContext } from "@/infra/container";
import { requireBoard } from "@/app/lib/auth";
import { type ActionState, fields, run } from "@/app/lib/action";

export async function createPostAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const principal = await requireBoard();
    const f = fields(formData, ["title", "body"]);
    const endDateRaw = formData.get("endDate");
    const endDate = endDateRaw && typeof endDateRaw === "string" && endDateRaw !== ""
      ? new Date(endDateRaw)
      : null;
    await createPost(getContext(), principal, { title: f.title, body: f.body, endDate });
    revalidatePath("/app/anslag");
    revalidatePath("/app");
  });
}

export async function deletePostAction(formData: FormData): Promise<void> {
  const principal = await requireBoard();
  const postId = formData.get("postId");
  if (typeof postId !== "string" || !postId) throw new Error("Missing postId");
  await deletePost(getContext(), principal, postId);
  revalidatePath("/app/anslag");
  revalidatePath("/app");
}

export async function addDocumentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const principal = await requireBoard();
    const f = fields(formData, ["title", "url"]);
    await addDocument(getContext(), principal, { title: f.title, url: f.url });
    revalidatePath("/app/anslag");
  });
}
