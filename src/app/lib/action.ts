import { DomainError } from "@/core/domain/errors";

export type ActionState = { error?: string; ok?: boolean };

export const idle: ActionState = {};

/**
 * Wraps a server action body so domain errors become a friendly message in the
 * form state instead of crashing. Re-throws framework control-flow (redirect).
 */
export async function run(
  fn: () => Promise<ActionState | void>,
): Promise<ActionState> {
  try {
    return (await fn()) ?? { ok: true };
  } catch (err) {
    // next/navigation redirect & notFound throw special errors we must rethrow.
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest: unknown }).digest === "string" &&
      ((err as { digest: string }).digest.startsWith("NEXT_REDIRECT") ||
        (err as { digest: string }).digest === "NEXT_NOT_FOUND")
    ) {
      throw err;
    }
    if (err instanceof DomainError) {
      return { error: err.message };
    }
    console.error(err);
    return { error: "Något gick fel. Försök igen." };
  }
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

export function fields(formData: FormData, keys: string[]): Record<string, string> {
  return Object.fromEntries(keys.map((k) => [k, str(formData, k)]));
}
