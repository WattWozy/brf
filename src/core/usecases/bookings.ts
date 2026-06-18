import type { Booking, Principal, Resource } from "../domain/entities";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../domain/errors";
import type { UseCaseContext } from "./context";

/** Board creates bookable resources (laundry room, guest flat, ...). */
export async function createResource(
  ctx: UseCaseContext,
  principal: Principal,
  name: string,
): Promise<Resource> {
  if (principal.role !== "STYRELSE") {
    throw new ForbiddenError("Endast styrelsen kan skapa resurser.");
  }
  if (name.trim().length < 2) {
    throw new ValidationError("Ange ett namn på resursen.");
  }
  return ctx.resources.create({ name: name.trim(), brfId: principal.brfId });
}

export async function listResources(
  ctx: UseCaseContext,
  principal: Principal,
): Promise<Resource[]> {
  return ctx.resources.listByBrf(principal.brfId);
}

export async function listBookings(
  ctx: UseCaseContext,
  principal: Principal,
  resourceId: string,
): Promise<Booking[]> {
  await loadOwnedResource(ctx, principal, resourceId);
  return ctx.bookings.listByResource(resourceId);
}

/** Any resident may book a free slot; overlaps are rejected. */
export async function book(
  ctx: UseCaseContext,
  principal: Principal,
  input: { resourceId: string; startTime: Date; endTime: Date },
): Promise<Booking> {
  await loadOwnedResource(ctx, principal, input.resourceId);
  if (
    Number.isNaN(input.startTime.getTime()) ||
    Number.isNaN(input.endTime.getTime())
  ) {
    throw new ValidationError("Ogiltig tid.");
  }
  if (input.endTime <= input.startTime) {
    throw new ValidationError("Sluttiden måste vara efter starttiden.");
  }
  if (input.startTime < new Date()) {
    throw new ValidationError("Du kan inte boka en tid som redan passerat.");
  }

  const overlapping = await ctx.bookings.findOverlapping(
    input.resourceId,
    input.startTime,
    input.endTime,
  );
  if (overlapping.length > 0) {
    throw new ConflictError("Tiden är redan bokad.");
  }

  return ctx.bookings.create({
    resourceId: input.resourceId,
    userId: principal.userId,
    startTime: input.startTime,
    endTime: input.endTime,
  });
}

async function loadOwnedResource(
  ctx: UseCaseContext,
  principal: Principal,
  resourceId: string,
): Promise<Resource> {
  const resource = await ctx.resources.findById(resourceId);
  if (!resource || resource.brfId !== principal.brfId) {
    throw new NotFoundError("Resursen hittades inte.");
  }
  return resource;
}
