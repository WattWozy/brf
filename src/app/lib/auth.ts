import { redirect } from "next/navigation";
import type { Principal } from "@/core/domain/entities";
import { getSession } from "@/infra/auth/session";

/** For pages/actions that require any signed-in user. Redirects otherwise. */
export async function requireSession(): Promise<Principal> {
  const principal = await getSession();
  if (!principal) {
    redirect("/login");
  }
  return principal;
}

/** For board-only pages. Redirects residents to the dashboard. */
export async function requireBoard(): Promise<Principal> {
  const principal = await requireSession();
  if (principal.role !== "STYRELSE") {
    redirect("/app");
  }
  return principal;
}

export { getSession };
