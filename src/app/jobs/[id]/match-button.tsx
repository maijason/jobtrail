"use client";

import { useActionState } from "react";
import { matchResumeAction, type MatchState } from "../actions";

export function MatchButton({
  jobId,
  hasMatches,
}: {
  jobId: string;
  hasMatches: boolean;
}) {
  const [state, formAction, isPending] = useActionState<MatchState, FormData>(
    matchResumeAction,
    { status: "idle" },
  );

  return (
    <form action={formAction} className="flex items-center gap-3">
      <input type="hidden" name="jobId" value={jobId} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-foreground px-3 py-1 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
      >
        {isPending
          ? "Matching…"
          : hasMatches
            ? "Re-match resume"
            : "Match my resume"}
      </button>
      {state.status === "error" && (
        <p role="status" className="text-sm text-red-600">
          {state.message}
        </p>
      )}
    </form>
  );
}
