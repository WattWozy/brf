import type { Bid, Job, Principal } from "../domain/entities";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../domain/errors";
import type { UseCaseContext } from "./context";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * PUBLIC use-case — no principal. A contractor opens the secret link and
 * submits a bid. Only published, un-awarded jobs accept bids.
 */
export async function submitBid(
  ctx: UseCaseContext,
  publicToken: string,
  input: {
    companyName: string;
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    priceSek: number;
    estimatedDays?: number;
    message?: string;
  },
): Promise<Bid> {
  const job = await ctx.jobs.findByPublicToken(publicToken);
  if (!job) {
    throw new NotFoundError("Uppdraget hittades inte.");
  }
  if (job.status !== "PUBLICERAT") {
    throw new ConflictError("Uppdraget tar inte längre emot bud.");
  }
  if (input.companyName.trim().length < 2) {
    throw new ValidationError("Ange företagsnamn.");
  }
  if (input.contactName.trim().length < 2) {
    throw new ValidationError("Ange kontaktperson.");
  }
  if (!EMAIL_RE.test(input.contactEmail.trim())) {
    throw new ValidationError("Ange en giltig e-postadress.");
  }
  if (!Number.isInteger(input.priceSek) || input.priceSek <= 0) {
    throw new ValidationError("Ange ett pris i hela kronor.");
  }
  if (
    input.estimatedDays !== undefined &&
    (!Number.isInteger(input.estimatedDays) || input.estimatedDays <= 0)
  ) {
    throw new ValidationError("Tidsuppskattningen måste vara ett positivt antal dagar.");
  }

  return ctx.bids.create({
    jobId: job.id,
    companyName: input.companyName.trim(),
    contactName: input.contactName.trim(),
    contactEmail: input.contactEmail.trim().toLowerCase(),
    contactPhone: input.contactPhone?.trim() || null,
    priceSek: input.priceSek,
    estimatedDays: input.estimatedDays ?? null,
    message: input.message?.trim() || null,
  });
}

/** Board-only: the public view of a job for the bid form (no internal data). */
export async function getPublicJob(
  ctx: UseCaseContext,
  publicToken: string,
): Promise<Pick<Job, "id" | "title" | "description" | "deadline" | "status">> {
  const job = await ctx.jobs.findByPublicToken(publicToken);
  if (!job) {
    throw new NotFoundError("Uppdraget hittades inte.");
  }
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    deadline: job.deadline,
    status: job.status,
  };
}

/** Board reviews all bids for one of their jobs. */
export async function listBids(
  ctx: UseCaseContext,
  principal: Principal,
  jobId: string,
): Promise<Bid[]> {
  if (principal.role !== "STYRELSE") {
    throw new ForbiddenError();
  }
  const job = await ctx.jobs.findById(jobId);
  if (!job || job.brfId !== principal.brfId) {
    throw new NotFoundError("Uppdraget hittades inte.");
  }
  return ctx.bids.listByJob(jobId);
}
