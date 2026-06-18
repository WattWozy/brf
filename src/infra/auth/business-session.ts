import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { BusinessPrincipal } from "@/core/domain/entities";

const COOKIE = "brf_business_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dagar

function secret(): Uint8Array {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 16) {
    throw new Error("SESSION_SECRET saknas eller är för kort.");
  }
  return new TextEncoder().encode(value);
}

export async function createBusinessSession(principal: BusinessPrincipal): Promise<void> {
  const token = await new SignJWT({
    companyName: principal.companyName,
    contactName: principal.contactName,
    email: principal.email,
    phone: principal.phone,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(principal.businessId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getBusinessSession(): Promise<BusinessPrincipal | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return {
      businessId: payload.sub,
      companyName: payload.companyName as string,
      contactName: payload.contactName as string,
      email: payload.email as string,
      phone: (payload.phone as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

export async function destroyBusinessSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
