"use server";

import { redirect } from "next/navigation";
import {
  authenticate,
  registerBrf,
  registerMember,
} from "@/core/usecases/auth";
import { getContext } from "@/infra/container";
import { createSession, destroySession } from "@/infra/auth/session";
import { type ActionState, fields, run } from "@/app/lib/action";

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const f = fields(formData, ["email", "password"]);
    const principal = await authenticate(getContext(), {
      email: f.email,
      password: f.password,
    });
    await createSession(principal);
    redirect("/app");
  });
}

export async function registerBrfAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const f = fields(formData, [
      "brfName",
      "orgNumber",
      "adminName",
      "adminEmail",
      "password",
    ]);
    const { user } = await registerBrf(getContext(), {
      brfName: f.brfName,
      orgNumber: f.orgNumber,
      adminName: f.adminName,
      adminEmail: f.adminEmail,
      password: f.password,
    });
    await createSession({
      userId: user.id,
      brfId: user.brfId,
      role: user.role,
    });
    redirect("/app");
  });
}

export async function joinBrfAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const f = fields(formData, [
      "brfId",
      "name",
      "email",
      "password",
      "apartment",
    ]);
    const user = await registerMember(getContext(), {
      brfId: f.brfId,
      name: f.name,
      email: f.email,
      password: f.password,
      apartment: f.apartment,
    });
    await createSession({
      userId: user.id,
      brfId: user.brfId,
      role: user.role,
    });
    redirect("/app");
  });
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
