import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { getJobDetails } from "@/lib/jobs";
import { dateFormat } from "../status";
import { ExtractButton } from "./extract-button";
import { StatusSelect } from "./status-select";

export const metadata: Metadata = {
  title: "Job · JobTrail",
};

export default function JobPage({ params }: PageProps<"/jobs/[id]">) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <Link
        href="/jobs"
        className="text-sm text-zinc-500 hover:text-foreground"
      >
        ← All jobs
      </Link>
      <Suspense
        fallback={<p className="mt-8 text-sm text-zinc-500">Loading…</p>}
      >
        <JobDetails params={params} />
      </Suspense>
    </main>
  );
}

async function JobDetails({
  params,
}: {
  params: PageProps<"/jobs/[id]">["params"];
}) {
  const id = z.uuid().safeParse((await params).id);
  if (!id.success) notFound();

  const details = await getJobDetails(id.data);
  if (!details) notFound();

  const { job, application, requirements } = details;
  const required = requirements.filter((r) => r.kind === "required");
  const preferred = requirements.filter((r) => r.kind === "preferred");

  return (
    <article className="mt-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{job.title}</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          {[job.company, job.location].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <StatusSelect jobId={job.id} status={application.status} />
          <span className="text-zinc-500">
            Saved {dateFormat.format(job.createdAt)}
            {application.appliedAt &&
              ` · Applied ${dateFormat.format(application.appliedAt)}`}
          </span>
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 underline hover:text-foreground"
          >
            Original posting ↗
          </a>
        </div>
      </header>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-medium">Requirements</h2>
          <ExtractButton
            jobId={job.id}
            hasRequirements={requirements.length > 0}
          />
        </div>
        {requirements.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">
            Not extracted yet. Extracting sends this job&apos;s description to
            Gemini.
          </p>
        ) : (
          <div className="mt-3 grid gap-6 sm:grid-cols-2">
            <RequirementList title="Required" items={required} />
            <RequirementList title="Preferred" items={preferred} />
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-medium">Description</h2>
        <p className="mt-3 text-sm leading-6 whitespace-pre-line text-zinc-700 dark:text-zinc-300">
          {job.description}
        </p>
      </section>
    </article>
  );
}

function RequirementList({
  title,
  items,
}: {
  title: string;
  items: { id: string; text: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="text-sm text-zinc-500">{title}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {items.map((item) => (
          <li key={item.id}>{item.text}</li>
        ))}
      </ul>
    </div>
  );
}
