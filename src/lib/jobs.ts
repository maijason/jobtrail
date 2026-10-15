import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { applications, jobs, type Job } from "@/db/schema";
import { normalizeJobUrl } from "@/lib/url";

export const saveJobSchema = z.object({
  url: z.url({ protocol: /^https?$/ }),
  company: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(200),
  location: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => value || undefined),
  description: z.string().trim().min(1).max(50_000),
});

export type SaveJobInput = z.infer<typeof saveJobSchema>;

/**
 * Save a job and start tracking it as "saved". If the posting was already
 * saved, return the existing job instead of creating a duplicate.
 */
export async function saveJob(
  input: SaveJobInput,
): Promise<{ job: Job; created: boolean }> {
  const url = normalizeJobUrl(input.url);

  return getDb().transaction(async (tx) => {
    const [job] = await tx
      .insert(jobs)
      .values({ ...input, url })
      .onConflictDoNothing({ target: jobs.url })
      .returning();

    if (job) {
      await tx.insert(applications).values({ jobId: job.id });
      return { job, created: true };
    }

    const [existing] = await tx.select().from(jobs).where(eq(jobs.url, url));
    return { job: existing, created: false };
  });
}

export async function listJobs() {
  return getDb()
    .select({
      id: jobs.id,
      url: jobs.url,
      company: jobs.company,
      title: jobs.title,
      location: jobs.location,
      status: applications.status,
      savedAt: jobs.createdAt,
    })
    .from(jobs)
    .innerJoin(applications, eq(applications.jobId, jobs.id))
    .orderBy(desc(jobs.createdAt));
}

/** Delete a job. Its application is removed by the foreign key cascade. */
export async function deleteJob(id: string) {
  await getDb().delete(jobs).where(eq(jobs.id, id));
}
