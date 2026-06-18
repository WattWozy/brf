import { redirect } from "next/navigation";
import type { BusinessPrincipal } from "@/core/domain/entities";
import { getBusinessSession } from "@/infra/auth/business-session";

export async function requireBusiness(): Promise<BusinessPrincipal> {
  const principal = await getBusinessSession();
  if (!principal) {
    redirect("/foretag/logga-in");
  }
  return principal;
}

export { getBusinessSession };
