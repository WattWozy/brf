import type { Job, Principal } from "../domain/entities";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../domain/errors";
import type { UseCaseContext } from "./context";

function assertBoard(principal: Principal): void {
  if (principal.role !== "STYRELSE") {
    throw new ForbiddenError("Endast styrelsen kan hantera uppdrag.");
  }
}

/**
 * The board creates a procurement job. Optionally derived from an issue, in
 * which case that issue is moved to TRIAGE so it's clear it's being handled.
 */
export async function createJob(
  ctx: UseCaseContext,
  principal: Principal,
  input: {
    title: string;
    description: string;
    deadline?: Date | null;
    issueId?: string;
  },
): Promise<Job> {
  assertBoard(principal);
  if (input.title.trim().length < 3) {
    throw new ValidationError("Titeln är för kort.");
  }
  if (input.description.trim().length < 10) {
    throw new ValidationError("Beskriv uppdraget tydligare (minst 10 tecken).");
  }

  if (input.issueId) {
    const issue = await ctx.issues.findById(input.issueId);
    if (!issue || issue.brfId !== principal.brfId) {
      throw new NotFoundError("Felanmälan hittades inte.");
    }
  }

  const job = await ctx.jobs.create({
    title: input.title.trim(),
    description: input.description.trim(),
    publicToken: ctx.tokens.generate(),
    deadline: input.deadline ?? null,
    brfId: principal.brfId,
    issueId: input.issueId ?? null,
  });

  if (input.issueId) {
    await ctx.issues.updateStatus(input.issueId, "TRIAGE");
  }
  return job;
}

/** Publishing makes the public bid link live. */
export async function publishJob(
  ctx: UseCaseContext,
  principal: Principal,
  jobId: string,
): Promise<Job> {
  assertBoard(principal);
  const job = await loadOwnedJob(ctx, principal, jobId);
  if (job.status !== "UTKAST") {
    throw new ConflictError("Endast utkast kan publiceras.");
  }
  return ctx.jobs.updateStatus(jobId, "PUBLICERAT");
}

export async function listJobs(
  ctx: UseCaseContext,
  principal: Principal,
): Promise<Job[]> {
  assertBoard(principal);
  return ctx.jobs.listByBrf(principal.brfId);
}

export async function getJob(
  ctx: UseCaseContext,
  principal: Principal,
  jobId: string,
): Promise<Job> {
  assertBoard(principal);
  return loadOwnedJob(ctx, principal, jobId);
}

/** The board picks a winning bid. The job moves to TILLDELAT. */
export async function awardBid(
  ctx: UseCaseContext,
  principal: Principal,
  jobId: string,
  bidId: string,
): Promise<Job> {
  assertBoard(principal);
  const job = await loadOwnedJob(ctx, principal, jobId);
  if (job.status === "KLART") {
    throw new ConflictError("Uppdraget är redan avslutat.");
  }
  const bid = await ctx.bids.findById(bidId);
  if (!bid || bid.jobId !== jobId) {
    throw new NotFoundError("Budet hittades inte.");
  }
  return ctx.jobs.award(jobId, bidId);
}

/** Advance the lifecycle (e.g. TILLDELAT -> PAGAR -> KLART). */
export async function setJobStatus(
  ctx: UseCaseContext,
  principal: Principal,
  jobId: string,
  status: Job["status"],
): Promise<Job> {
  assertBoard(principal);
  await loadOwnedJob(ctx, principal, jobId);
  return ctx.jobs.updateStatus(jobId, status);
}

async function loadOwnedJob(
  ctx: UseCaseContext,
  principal: Principal,
  jobId: string,
): Promise<Job> {
  const job = await ctx.jobs.findById(jobId);
  if (!job || job.brfId !== principal.brfId) {
    throw new NotFoundError("Uppdraget hittades inte.");
  }
  return job;
}
