"use client";

import { useActionState } from "react";
import { saveResumeAction, type SaveResumeState } from "./actions";

function describeRemoved({ emails, phones }: { emails: number; phones: number }) {
  const parts = [
    emails && `${emails} email${emails === 1 ? "" : "s"}`,
    phones && `${phones} phone number${phones === 1 ? "" : "s"}`,
  ].filter(Boolean);
  return parts.length ? `Removed ${parts.join(" and ")}.` : "";
}

export function ResumeForm({ content }: { content: string }) {
  const [state, formAction, isPending] = useActionState<
    SaveResumeState,
    FormData
  >(saveResumeAction, { status: "idle" });

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-3">
      {/* Remount when the saved text changes so you see the redacted version. */}
      <textarea
        key={content}
        name="content"
        defaultValue={content}
        required
        maxLength={50_000}
        rows={20}
        placeholder="Paste your resume as plain text…"
        className="w-full rounded-md border border-zinc-300 bg-transparent p-3 font-mono text-sm leading-6 dark:border-zinc-700"
      />
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save resume"}
        </button>
        <p role="status" className="text-sm">
          {state.status === "saved" && (
            <span className="text-green-600">
              Saved. {describeRemoved(state.removed)}
            </span>
          )}
          {state.status === "error" && (
            <span className="text-red-600">{state.message}</span>
          )}
        </p>
      </div>
    </form>
  );
}
