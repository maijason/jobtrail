import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { listJobs } from "@/lib/jobs";
import { Board } from "./board";

export const metadata: Metadata = {
  title: "Board · JobTrail",
};

export default function BoardPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Board</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Drag a job to another column, or use the menu on its card.
      </p>
      <Suspense
        fallback={<p className="mt-8 text-sm text-zinc-500">Loading…</p>}
      >
        <BoardData />
      </Suspense>
    </main>
  );
}

async function BoardData() {
  await connection();
  return <Board jobs={await listJobs()} />;
}
