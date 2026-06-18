"use server";

import { redirect } from "next/navigation";
import { loginBusiness, registerBusiness } from "@/core/usecases/businesses";
import { getContext } from "@/infra/container";
import {
  createBusinessSession,
  destroyBusinessSession,
} from "@/infra/auth/business-session";
import { type ActionState, fields, run } from "@/app/lib/action";

export async function registerBusinessAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const f = fields(formData, [
      "companyName",
      "orgNumber",
      "contactName",
      "email",
      "password",
      "phone",
      "description",
    ]);
    const business = await registerBusiness(getContext(), {
      companyName: f.companyName,
      orgNumber: f.orgNumber,
      contactName: f.contactName,
      email: f.email,
      password: f.password,
      phone: f.phone,
      description: f.description,
    });
    await createBusinessSession({
      businessId: business.id,
      companyName: business.companyName,
      contactName: business.contactName,
      email: business.email,
      phone: business.phone,
    });
    redirect("/foretag/uppdrag");
  });
}

export async function loginBusinessAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const f = fields(formData, ["email", "password"]);
    const principal = await loginBusiness(getContext(), {
      email: f.email,
      password: f.password,
    });
    await createBusinessSession(principal);
    redirect("/foretag/uppdrag");
  });
}

export async function logoutBusinessAction(): Promise<void> {
  await destroyBusinessSession();
  redirect("/foretag/logga-in");
}

export async function deleteBidAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const { requireBusiness } = await import("@/app/lib/business-auth");
    const { deleteBid } = await import("@/core/usecases/bids");
    const { revalidatePath } = await import("next/cache");
    const principal = await requireBusiness();
    const { bidId } = fields(formData, ["bidId"]);
    await deleteBid(getContext(), principal, bidId);
    revalidatePath("/foretag/mina-bud");
    revalidatePath("/foretag/uppdrag");
  });
}

export async function submitBidAsBusinessAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const { requireBusiness } = await import("@/app/lib/business-auth");
    const { submitBidAsBusiness } = await import("@/core/usecases/bids");
    const principal = await requireBusiness();
    const f = fields(formData, [
      "jobId",
      "companyName",
      "contactName",
      "contactEmail",
      "contactPhone",
      "priceSek",
      "estimatedDays",
      "message",
    ]);
    await submitBidAsBusiness(getContext(), principal, f.jobId, {
      companyName: f.companyName,
      contactName: f.contactName,
      contactEmail: f.contactEmail,
      contactPhone: f.contactPhone,
      priceSek: Number.parseInt(f.priceSek, 10),
      estimatedDays: f.estimatedDays ? Number.parseInt(f.estimatedDays, 10) : undefined,
      message: f.message,
    });
    return { ok: true };
  });
}
