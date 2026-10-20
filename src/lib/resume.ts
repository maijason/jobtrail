import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { resumes, type Resume } from "@/db/schema";
import { redactContactInfo, type RedactionResult } from "@/lib/redact";

export const resumeContentSchema = z.string().trim().min(1).max(50_000);

// One resume for now. The table allows more so versions can come later.
export async function getResume(): Promise<Resume | null> {
  const [resume] = await getDb()
    .select()
    .from(resumes)
    .orderBy(asc(resumes.createdAt))
    .limit(1);
  return resume ?? null;
}

/** Redact contact info, then create or replace the saved resume. */
export async function saveResume(
  content: string,
): Promise<RedactionResult["removed"]> {
  const { text, removed } = redactContactInfo(content);

  await getDb().transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: resumes.id })
      .from(resumes)
      .orderBy(asc(resumes.createdAt))
      .limit(1);

    if (existing) {
      await tx
        .update(resumes)
        .set({ content: text })
        .where(eq(resumes.id, existing.id));
    } else {
      await tx.insert(resumes).values({ name: "Resume", content: text });
    }
  });

  return removed;
}
