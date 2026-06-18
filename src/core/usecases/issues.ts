import type { Issue, IssueStatus, Principal } from "../domain/entities";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../domain/errors";
import type { UseCaseContext } from "./context";

/** Any resident can report an issue in their own BRF. */
export async function reportIssue(
  ctx: UseCaseContext,
  principal: Principal,
  input: {
    title: string;
    description: string;
    location?: string;
    imageUrl?: string;
  },
): Promise<Issue> {
  if (input.title.trim().length < 3) {
    throw new ValidationError("Titeln är för kort.");
  }
  if (input.description.trim().length < 3) {
    throw new ValidationError("Beskrivningen är för kort.");
  }
  return ctx.issues.create({
    title: input.title.trim(),
    description: input.description.trim(),
    location: input.location?.trim() || null,
    imageUrl: input.imageUrl?.trim() || null,
    brfId: principal.brfId,
    authorId: principal.userId,
  });
}

export async function listIssues(
  ctx: UseCaseContext,
  principal: Principal,
): Promise<Issue[]> {
  return ctx.issues.listByBrf(principal.brfId);
}

/** Only the board may change an issue's status. */
export async function setIssueStatus(
  ctx: UseCaseContext,
  principal: Principal,
  issueId: string,
  status: IssueStatus,
): Promise<Issue> {
  if (principal.role !== "STYRELSE") {
    throw new ForbiddenError();
  }
  const issue = await ctx.issues.findById(issueId);
  if (!issue || issue.brfId !== principal.brfId) {
    throw new NotFoundError("Felanmälan hittades inte.");
  }
  return ctx.issues.updateStatus(issueId, status);
}
