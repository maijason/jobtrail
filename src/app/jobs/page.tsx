import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { listJobs } from "@/lib/jobs";
import { DeleteJobButton } from "./delete-job-button";
import { dateFormat, STATUS_LABELS, STATUS_STYLES } from "./status";

export const metadata: Metadata = {
  title: "Saved jobs · JobTrail",
};

export default function JobsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Saved jobs</h1>
      <Suspense
        fallback={<p className="mt-8 text-sm text-zinc-500">Loading…</p>}
      >
        <JobList />
      </Suspense>
    </main>
  );
}

async function JobList() {
  // Always read fresh rows at request time instead of during the build.
  await connection();
  const jobs = await listJobs();

  if (jobs.length === 0) {
    return (
      <p className="mt-8 text-zinc-600 dark:text-zinc-400">
        No jobs saved yet. Open a job posting and click the JobTrail extension
        to save it.
      </p>
    );
  }

  return (
    <ul className="mt-8 divide-y divide-zinc-200 border-y border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      {jobs.map((job) => (
        <li key={job.id} className="flex items-center gap-4 py-4">
          <div className="min-w-0 flex-1">
            <Link
              href={`/jobs/${job.id}`}
              className="font-medium hover:underline"
            >
              {job.title}
            </Link>
            <p className="mt-1 truncate text-sm text-zinc-600 dark:text-zinc-400">
              {[job.company, job.location].filter(Boolean).join(" · ")}
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[job.status]}`}
          >
            {STATUS_LABELS[job.status]}
          </span>
          <time
            dateTime={job.savedAt.toISOString()}
            className="w-14 text-right text-sm text-zinc-500"
          >
            {dateFormat.format(job.savedAt)}
          </time>
          <DeleteJobButton id={job.id} title={job.title} />
        </li>
      ))}
    </ul>
  );
}
