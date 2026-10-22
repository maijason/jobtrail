import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { jobs, requirements } from "@/db/schema";
import { createGeminiGenerateJson } from "@/lib/llm/gemini";
import { extractRequirements, type GenerateJson } from "@/lib/requirements";

/**
 * Extract a job's requirements with the LLM and replace any saved ones.
 * Returns how many were found, or null if the job doesn't exist.
 */
export async function extractAndSaveRequirements(
  jobId: string,
  generate: GenerateJson = createGeminiGenerateJson(),
): Promise<number | null> {
  const db = getDb();
  const [job] = await db
    .select({ description: jobs.description })
    .from(jobs)
    .where(eq(jobs.id, jobId));
  if (!job) return null;

  // Call the model before opening a transaction so a slow response
  // doesn't hold a database connection.
  const found = await extractRequirements(job.description, generate);

  await db.transaction(async (tx) => {
    await tx.delete(requirements).where(eq(requirements.jobId, jobId));
    if (found.length > 0) {
      await tx.insert(requirements).values(
        found.map((requirement, position) => ({
          jobId,
          position,
          ...requirement,
        })),
      );
    }
  });

  return found.length;
}
