import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { applicationStatus, applications } from "@/db/schema";

export const statusSchema = z.enum(applicationStatus.enumValues);
export type ApplicationStatus = z.infer<typeof statusSchema>;

// Statuses that mean you've sent the application.
const SUBMITTED: ReadonlySet<ApplicationStatus> = new Set([
  "applied",
  "interviewing",
  "offer",
  "rejected",
]);

/**
 * When an application moves to a new status, work out its "applied" date:
 * set it the first time it's submitted, keep it after that, and clear it if
 * the application goes back to "saved".
 */
export function nextAppliedAt(
  status: ApplicationStatus,
  current: Date | null,
  now: Date,
): Date | null {
  if (status === "saved") return null;
  if (current) return current;
  return SUBMITTED.has(status) ? now : null;
}

export async function updateApplicationStatus(
  jobId: string,
  status: ApplicationStatus,
) {
  await getDb().transaction(async (tx) => {
    const [application] = await tx
      .select({ appliedAt: applications.appliedAt })
      .from(applications)
      .where(eq(applications.jobId, jobId))
      .for("update");
    if (!application) return;

    await tx
      .update(applications)
      .set({
        status,
        appliedAt: nextAppliedAt(status, application.appliedAt, new Date()),
      })
      .where(eq(applications.jobId, jobId));
  });
}
