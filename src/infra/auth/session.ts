import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { Principal } from "@/core/domain/entities";

const COOKIE = "brf_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 dagar

function secret(): Uint8Array {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 16) {
    throw new Error("SESSION_SECRET saknas eller är för kort.");
  }
  return new TextEncoder().encode(value);
}

/** Issues a signed session cookie for the authenticated principal. */
export async function createSession(principal: Principal): Promise<void> {
  const token = await new SignJWT({
    brfId: principal.brfId,
    role: principal.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(principal.userId)
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

/** Reads and verifies the current principal, or null if not signed in. */
export async function getSession(): Promise<Principal | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return {
      userId: payload.sub,
      brfId: payload.brfId as string,
      role: payload.role as Principal["role"],
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
