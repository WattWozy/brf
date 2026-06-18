"use client";

import { useActionState } from "react";
import { type ActionState, idle } from "@/app/lib/action";

/**
 * A single-button form bound to a server action, with hidden field values.
 * Reuses the (prevState, formData) action signature via useActionState.
 */
export function InlineAction({
  action,
  label,
  hidden,
  variant = "secondary",
  confirm,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  label: string;
  hidden: Record<string, string>;
  variant?: "primary" | "secondary" | "danger";
  confirm?: string;
}) {
  const [state, formAction, pending] = useActionState(action, idle);
  const styles = {
    primary: "bg-slate-900 text-white hover:bg-slate-700",
    secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
  }[variant];

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
      className="inline-block"
    >
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button
        type="submit"
        disabled={pending}
        title={state.error ?? undefined}
        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${styles}`}
      >
        {pending ? "…" : label}
      </button>
    </form>
  );
}
