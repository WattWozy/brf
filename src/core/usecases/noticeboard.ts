import type { BrfDocument, Post, Principal } from "../domain/entities";
import { ForbiddenError, ValidationError } from "../domain/errors";
import type { UseCaseContext } from "./context";

/** Board posts an announcement to the noticeboard. */
export async function createPost(
  ctx: UseCaseContext,
  principal: Principal,
  input: { title: string; body: string },
): Promise<Post> {
  if (principal.role !== "STYRELSE") {
    throw new ForbiddenError("Endast styrelsen kan publicera anslag.");
  }
  if (input.title.trim().length < 3) {
    throw new ValidationError("Titeln är för kort.");
  }
  if (input.body.trim().length < 3) {
    throw new ValidationError("Texten är för kort.");
  }
  return ctx.posts.create({
    title: input.title.trim(),
    body: input.body.trim(),
    brfId: principal.brfId,
    authorId: principal.userId,
  });
}

export async function listPosts(
  ctx: UseCaseContext,
  principal: Principal,
): Promise<Post[]> {
  return ctx.posts.listByBrf(principal.brfId);
}

/** Board adds a document link to the archive. */
export async function addDocument(
  ctx: UseCaseContext,
  principal: Principal,
  input: { title: string; url: string },
): Promise<BrfDocument> {
  if (principal.role !== "STYRELSE") {
    throw new ForbiddenError("Endast styrelsen kan lägga till dokument.");
  }
  if (input.title.trim().length < 2) {
    throw new ValidationError("Ange en titel.");
  }
  try {
    new URL(input.url);
  } catch {
    throw new ValidationError("Ange en giltig länk (URL).");
  }
  return ctx.documents.create({
    title: input.title.trim(),
    url: input.url.trim(),
    brfId: principal.brfId,
  });
}

export async function listDocuments(
  ctx: UseCaseContext,
  principal: Principal,
): Promise<BrfDocument[]> {
  return ctx.documents.listByBrf(principal.brfId);
}
