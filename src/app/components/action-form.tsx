"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import { type ActionState, idle } from "@/app/lib/action";

/**
 * Generic form bound to a server action via useActionState. Renders error /
 * success feedback and a pending submit button. The action receives the
 * standard (prevState, formData) signature.
 */
export function ActionForm({
  action,
  submitLabel,
  successMessage,
  children,
  className = "",
  variant = "primary",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  successMessage?: string;
  children?: ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
}) {
  const [state, formAction, pending] = useActionState(action, idle);
  const showSuccess = state.ok && successMessage;

  return (
    <form action={formAction} className={`space-y-3 ${className}`}>
      {children}
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {showSuccess && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={
          variant === "primary"
            ? "inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-50"
            : "inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        }
      >
        {pending ? "Sparar…" : submitLabel}
      </button>
    </form>
  );
}
