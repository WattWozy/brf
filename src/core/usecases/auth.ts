import type { Principal, User } from "../domain/entities";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "../domain/errors";
import type { UseCaseContext } from "./context";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function assertPassword(password: string): void {
  if (password.length < 8) {
    throw new ValidationError("Lösenordet måste vara minst 8 tecken.");
  }
}

function assertEmail(email: string): void {
  if (!EMAIL_RE.test(email)) {
    throw new ValidationError("Ogiltig e-postadress.");
  }
}

/**
 * Bootstraps a brand-new BRF together with its first board member (admin).
 * Used when a förening signs up to try the platform.
 */
export async function registerBrf(
  ctx: UseCaseContext,
  input: {
    brfName: string;
    orgNumber?: string;
    adminName: string;
    adminEmail: string;
    password: string;
  },
): Promise<{ user: User; brfId: string }> {
  const email = normalizeEmail(input.adminEmail);
  assertEmail(email);
  assertPassword(input.password);
  if (input.brfName.trim().length < 2) {
    throw new ValidationError("Föreningens namn är för kort.");
  }
  if (await ctx.users.findByEmail(email)) {
    throw new ConflictError("E-postadressen är redan registrerad.");
  }

  const brf = await ctx.brfs.create({
    name: input.brfName.trim(),
    orgNumber: input.orgNumber?.trim() || null,
  });
  const passwordHash = await ctx.hasher.hash(input.password);
  const user = await ctx.users.create({
    email,
    name: input.adminName.trim(),
    passwordHash,
    role: "STYRELSE",
    apartment: null,
    brfId: brf.id,
  });
  return { user, brfId: brf.id };
}

/** Registers a resident into an existing BRF. */
export async function registerMember(
  ctx: UseCaseContext,
  input: {
    brfId: string;
    name: string;
    email: string;
    password: string;
    apartment?: string;
  },
): Promise<User> {
  const email = normalizeEmail(input.email);
  assertEmail(email);
  assertPassword(input.password);
  if (!(await ctx.brfs.findById(input.brfId))) {
    throw new ValidationError("Föreningen finns inte.");
  }
  if (await ctx.users.findByEmail(email)) {
    throw new ConflictError("E-postadressen är redan registrerad.");
  }

  const passwordHash = await ctx.hasher.hash(input.password);
  return ctx.users.create({
    email,
    name: input.name.trim(),
    passwordHash,
    role: "BOENDE",
    apartment: input.apartment?.trim() || null,
    brfId: input.brfId,
  });
}

/** Verifies credentials and returns the principal for a session. */
export async function authenticate(
  ctx: UseCaseContext,
  input: { email: string; password: string },
): Promise<Principal> {
  const email = normalizeEmail(input.email);
  const user = await ctx.users.findByEmail(email);
  if (!user) {
    throw new UnauthorizedError("Fel e-post eller lösenord.");
  }
  const ok = await ctx.hasher.verify(input.password, user.passwordHash);
  if (!ok) {
    throw new UnauthorizedError("Fel e-post eller lösenord.");
  }
  return { userId: user.id, brfId: user.brfId, role: user.role };
}
