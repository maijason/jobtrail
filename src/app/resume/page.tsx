import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { getResume } from "@/lib/resume";
import { ResumeForm } from "./resume-form";

export const metadata: Metadata = {
  title: "Resume · JobTrail",
};

export default function ResumePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Resume</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        JobTrail matches job requirements against this text. Email addresses
        and phone numbers are removed automatically when you save. Check that
        nothing else personal is left (like a home address) before saving.
      </p>
      <Suspense
        fallback={<p className="mt-6 text-sm text-zinc-500">Loading…</p>}
      >
        <SavedResume />
      </Suspense>
    </main>
  );
}

async function SavedResume() {
  await connection();
  const resume = await getResume();
  return <ResumeForm content={resume?.content ?? ""} />;
}
