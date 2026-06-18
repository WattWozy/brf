"use client";

import { useState } from "react";
import { deletePostAction } from "@/app/actions/noticeboard";

export function DeletePostButton({ postId }: { postId: string }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">Ta bort?</span>
        <form action={deletePostAction}>
          <input type="hidden" name="postId" value={postId} />
          <button
            type="submit"
            className="rounded bg-red-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-red-700"
          >
            Ja, ta bort
          </button>
        </form>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded border border-slate-300 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-50"
        >
          Avbryt
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="rounded px-2 py-0.5 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600"
    >
      Ta bort
    </button>
  );
}
