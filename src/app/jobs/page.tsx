import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import type { Application } from "@/db/schema";
import { listJobs } from "@/lib/jobs";
import { DeleteJobButton } from "./delete-job-button";

export const metadata: Metadata = {
  title: "Saved jobs · JobTrail",
};

const STATUS_STYLES: Record<Application["status"], string> = {
  saved: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  interviewing:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  offer: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  withdrawn: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

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
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              {job.title}
            </a>
            <p className="mt-1 truncate text-sm text-zinc-600 dark:text-zinc-400">
              {[job.company, job.location].filter(Boolean).join(" · ")}
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[job.status]}`}
          >
            {job.status}
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
