"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import type { ApplicationStatus } from "@/lib/applications";
import type { JobListItem } from "@/lib/jobs";
import { updateStatusAction } from "../jobs/actions";
import { STATUS_LABELS } from "../jobs/status";
import { applyMove, groupByStatus, type Move } from "./columns";

const STATUSES = Object.keys(STATUS_LABELS) as ApplicationStatus[];

export function Board({ jobs }: { jobs: JobListItem[] }) {
  const [optimisticJobs, moveOptimistically] = useOptimistic(jobs, applyMove);
  const [, startTransition] = useTransition();
  const [dropTarget, setDropTarget] = useState<ApplicationStatus | null>(null);

  function move({ id, status }: Move) {
    const job = optimisticJobs.find((j) => j.id === id);
    if (!job || job.status === status) return;

    startTransition(async () => {
      moveOptimistically({ id, status });
      const formData = new FormData();
      formData.set("jobId", id);
      formData.set("status", status);
      await updateStatusAction(formData);
    });
  }

  const columns = groupByStatus(optimisticJobs, STATUSES);

  return (
    <div className="mt-8 flex gap-4 overflow-x-auto pb-4">
      {STATUSES.map((status) => {
        const columnJobs = columns.get(status) ?? [];
        return (
          <section
            key={status}
            aria-label={STATUS_LABELS[status]}
            onDragOver={(event) => {
              event.preventDefault();
              setDropTarget(status);
            }}
            onDragLeave={(event) => {
              // Moving over a card inside the column also fires dragleave.
              if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                setDropTarget(null);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDropTarget(null);
              move({ id: event.dataTransfer.getData("text/plain"), status });
            }}
            className={`flex w-64 shrink-0 flex-col rounded-lg border p-3 transition-colors ${
              dropTarget === status
                ? "border-zinc-400 bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900"
                : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <h2 className="flex items-center justify-between text-sm font-medium">
              {STATUS_LABELS[status]}
              <span className="text-zinc-500">{columnJobs.length}</span>
            </h2>
            <ul className="mt-3 flex min-h-24 flex-col gap-2">
              {columnJobs.map((job) => (
                <li
                  key={job.id}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", job.id);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  className="cursor-grab rounded-md border border-zinc-200 bg-background p-3 shadow-sm active:cursor-grabbing dark:border-zinc-800"
                >
                  <Link
                    href={`/jobs/${job.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {job.title}
                  </Link>
                  <p className="mt-1 truncate text-xs text-zinc-500">
                    {job.company}
                  </p>
                  {/* Keyboard- and touch-friendly alternative to dragging. */}
                  <select
                    aria-label={`Move ${job.title}`}
                    value={job.status}
                    onChange={(event) =>
                      move({
                        id: job.id,
                        status: event.target.value as ApplicationStatus,
                      })
                    }
                    className="mt-2 w-full rounded border border-zinc-200 bg-transparent px-1.5 py-1 text-xs dark:border-zinc-800"
                  >
                    {STATUSES.map((option) => (
                      <option key={option} value={option}>
                        {STATUS_LABELS[option]}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
