"use server";

import { revalidatePath } from "next/cache";
import type { IssueStatus } from "@/core/domain/entities";
import { reportIssue, setIssueStatus } from "@/core/usecases/issues";
import { getContext } from "@/infra/container";
import { requireBoard, requireSession } from "@/app/lib/auth";
import { type ActionState, fields, run } from "@/app/lib/action";

export async function reportIssueAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const principal = await requireSession();
    const f = fields(formData, ["title", "description", "location"]);
    await reportIssue(getContext(), principal, {
      title: f.title,
      description: f.description,
      location: f.location,
    });
    revalidatePath("/app/felanmalan");
  });
}

export async function setIssueStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const principal = await requireBoard();
    const f = fields(formData, ["issueId", "status"]);
    await setIssueStatus(
      getContext(),
      principal,
      f.issueId,
      f.status as IssueStatus,
    );
    revalidatePath("/app/felanmalan");
  });
}
