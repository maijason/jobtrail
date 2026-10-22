"use client";

import { useActionState } from "react";
import { extractRequirementsAction, type ExtractState } from "../actions";

export function ExtractButton({
  jobId,
  hasRequirements,
}: {
  jobId: string;
  hasRequirements: boolean;
}) {
  const [state, formAction, isPending] = useActionState<ExtractState, FormData>(
    extractRequirementsAction,
    { status: "idle" },
  );

  return (
    <form action={formAction} className="flex items-center gap-3">
      <input type="hidden" name="jobId" value={jobId} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        {isPending
          ? "Extracting…"
          : hasRequirements
            ? "Re-extract"
            : "Extract requirements"}
      </button>
      <p role="status" className="text-sm">
        {state.status === "error" && (
          <span className="text-red-600">{state.message}</span>
        )}
        {state.status === "done" && state.count === 0 && (
          <span className="text-zinc-500">No requirements found.</span>
        )}
      </p>
    </form>
  );
}
