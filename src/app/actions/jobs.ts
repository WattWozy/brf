"use server";

import { revalidatePath } from "next/cache";
import type { JobCategory, JobPriority, JobStatus } from "@/core/domain/entities";
import {
  awardBid,
  createJob,
  publishJob,
  setJobStatus,
} from "@/core/usecases/jobs";
import { getContext } from "@/infra/container";
import { requireBoard } from "@/app/lib/auth";
import { type ActionState, fields, run } from "@/app/lib/action";

export async function createJobAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const principal = await requireBoard();
    const f = fields(formData, ["title", "description", "category", "priority", "deadline", "issueId"]);
    await createJob(getContext(), principal, {
      title: f.title,
      description: f.description,
      category: (f.category || "ANNAT") as JobCategory,
      priority: (f.priority || "MEDEL") as JobPriority,
      deadline: f.deadline ? new Date(f.deadline) : null,
      issueId: f.issueId || undefined,
    });
    revalidatePath("/app/uppdrag");
    revalidatePath("/app/felanmalan");
  });
}

export async function publishJobAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const principal = await requireBoard();
    const jobId = fields(formData, ["jobId"]).jobId;
    await publishJob(getContext(), principal, jobId);
    revalidatePath(`/app/uppdrag/${jobId}`);
    revalidatePath("/app/uppdrag");
  });
}

export async function awardBidAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const principal = await requireBoard();
    const f = fields(formData, ["jobId", "bidId"]);
    await awardBid(getContext(), principal, f.jobId, f.bidId);
    revalidatePath(`/app/uppdrag/${f.jobId}`);
  });
}

export async function setJobStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const principal = await requireBoard();
    const f = fields(formData, ["jobId", "status"]);
    await setJobStatus(getContext(), principal, f.jobId, f.status as JobStatus);
    revalidatePath(`/app/uppdrag/${f.jobId}`);
    revalidatePath("/app/uppdrag");
  });
}
