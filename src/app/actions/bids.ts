"use server";

import { submitBid } from "@/core/usecases/bids";
import { getContext } from "@/infra/container";
import { type ActionState, fields, run } from "@/app/lib/action";

/** PUBLIC action — invoked from the contractor's bid page, no auth. */
export async function submitBidAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const f = fields(formData, [
      "publicToken",
      "companyName",
      "contactName",
      "contactEmail",
      "contactPhone",
      "priceSek",
      "estimatedDays",
      "message",
    ]);
    await submitBid(getContext(), f.publicToken, {
      companyName: f.companyName,
      contactName: f.contactName,
      contactEmail: f.contactEmail,
      contactPhone: f.contactPhone,
      priceSek: Number.parseInt(f.priceSek, 10),
      estimatedDays: f.estimatedDays
        ? Number.parseInt(f.estimatedDays, 10)
        : undefined,
      message: f.message,
    });
    return { ok: true };
  });
}
