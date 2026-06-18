"use client";

import { useState } from "react";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-600"
      />
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium hover:bg-slate-50"
      >
        {copied ? "Kopierad!" : "Kopiera"}
      </button>
    </div>
  );
}
