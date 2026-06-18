"use server";

import { revalidatePath } from "next/cache";
import { book, createResource } from "@/core/usecases/bookings";
import { getContext } from "@/infra/container";
import { requireBoard, requireSession } from "@/app/lib/auth";
import { type ActionState, fields, run } from "@/app/lib/action";

export async function createResourceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const principal = await requireBoard();
    await createResource(getContext(), principal, fields(formData, ["name"]).name);
    revalidatePath("/app/bokningar");
  });
}

export async function bookAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const principal = await requireSession();
    const f = fields(formData, ["resourceId", "startTime", "endTime"]);
    await book(getContext(), principal, {
      resourceId: f.resourceId,
      startTime: new Date(f.startTime),
      endTime: new Date(f.endTime),
    });
    revalidatePath("/app/bokningar");
  });
}
