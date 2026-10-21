import type { ApplicationStatus } from "@/lib/applications";
import type { JobListItem } from "@/lib/jobs";

export type Move = { id: string; status: ApplicationStatus };

/** Apply a move to the list so the card jumps columns before the server answers. */
export function applyMove(jobs: JobListItem[], move: Move): JobListItem[] {
  return jobs.map((job) =>
    job.id === move.id ? { ...job, status: move.status } : job,
  );
}

/** Group jobs by status, keeping every column even when it's empty. */
export function groupByStatus(
  jobs: JobListItem[],
  statuses: readonly ApplicationStatus[],
): Map<ApplicationStatus, JobListItem[]> {
  const columns = new Map(
    statuses.map((status) => [status, [] as JobListItem[]]),
  );
  for (const job of jobs) columns.get(job.status)?.push(job);
  return columns;
}
