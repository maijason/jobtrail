"use client";

import { useTransition } from "react";
import type { ApplicationStatus } from "@/lib/applications";
import { updateStatusAction } from "../actions";
import { STATUS_LABELS } from "../status";

export function StatusSelect({
  jobId,
  status,
}: {
  jobId: string;
  status: ApplicationStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      name="status"
      aria-label="Application status"
      defaultValue={status}
      disabled={isPending}
      onChange={(event) => {
        const formData = new FormData();
        formData.set("jobId", jobId);
        formData.set("status", event.target.value);
        startTransition(() => updateStatusAction(formData));
      }}
      className="rounded-md border border-zinc-300 bg-transparent px-2 py-1 text-sm disabled:opacity-50 dark:border-zinc-700"
    >
      {Object.entries(STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
