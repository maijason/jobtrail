import { asc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { matches, requirements } from "@/db/schema";
import { createGeminiGenerateJson } from "@/lib/llm/gemini";
import { matchRequirements } from "@/lib/matching";
import type { GenerateJson } from "@/lib/requirements";
import { getResume } from "@/lib/resume";

export type MatchJobResult =
  | { status: "done"; count: number }
  | { status: "no-resume" }
  | { status: "no-requirements" };

/** Match a job's requirements against the saved resume and store the results. */
export async function matchJobToResume(
  jobId: string,
  generate?: GenerateJson,
): Promise<MatchJobResult> {
  const db = getDb();

  const resume = await getResume();
  if (!resume) return { status: "no-resume" };

  const jobRequirements = await db
    .select({ id: requirements.id, text: requirements.text })
    .from(requirements)
    .where(eq(requirements.jobId, jobId))
    .orderBy(asc(requirements.position));
  if (jobRequirements.length === 0) return { status: "no-requirements" };

  // Call the model outside the transaction so it doesn't hold a connection.
  const results = await matchRequirements(
    jobRequirements,
    resume.content,
    generate ?? createGeminiGenerateJson(),
  );

  await db.transaction(async (tx) => {
    await tx.delete(matches).where(
      inArray(
        matches.requirementId,
        jobRequirements.map((r) => r.id),
      ),
    );
    await tx.insert(matches).values(results);
  });

  return { status: "done", count: results.length };
}
