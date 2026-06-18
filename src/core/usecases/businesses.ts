import type { Business, BusinessPrincipal } from "../domain/entities";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../domain/errors";
import type { UseCaseContext } from "./context";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerBusiness(
  ctx: UseCaseContext,
  input: {
    companyName: string;
    orgNumber?: string;
    contactName: string;
    email: string;
    password: string;
    phone?: string;
    description?: string;
  },
): Promise<Business> {
  if (input.companyName.trim().length < 2) {
    throw new ValidationError("Ange företagsnamn.");
  }
  if (input.contactName.trim().length < 2) {
    throw new ValidationError("Ange kontaktperson.");
  }
  if (!EMAIL_RE.test(input.email.trim())) {
    throw new ValidationError("Ange en giltig e-postadress.");
  }
  if (input.password.length < 8) {
    throw new ValidationError("Lösenordet måste vara minst 8 tecken.");
  }

  const existing = await ctx.businesses.findByEmail(input.email.trim().toLowerCase());
  if (existing) {
    throw new ConflictError("E-postadressen är redan registrerad.");
  }

  const passwordHash = await ctx.hasher.hash(input.password);
  return ctx.businesses.create({
    companyName: input.companyName.trim(),
    orgNumber: input.orgNumber?.trim() || null,
    contactName: input.contactName.trim(),
    email: input.email.trim().toLowerCase(),
    passwordHash,
    phone: input.phone?.trim() || null,
    description: input.description?.trim() || null,
  });
}

export async function loginBusiness(
  ctx: UseCaseContext,
  input: { email: string; password: string },
): Promise<BusinessPrincipal> {
  const business = await ctx.businesses.findByEmail(input.email.trim().toLowerCase());
  if (!business) {
    throw new NotFoundError("Felaktiga inloggningsuppgifter.");
  }
  const ok = await ctx.hasher.verify(input.password, business.passwordHash);
  if (!ok) {
    throw new NotFoundError("Felaktiga inloggningsuppgifter.");
  }
  return {
    businessId: business.id,
    companyName: business.companyName,
    contactName: business.contactName,
    email: business.email,
    phone: business.phone,
  };
}
