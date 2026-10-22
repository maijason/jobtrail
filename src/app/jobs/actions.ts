"use server";

import { ApiError } from "@google/genai";
import { refresh } from "next/cache";
import { z } from "zod";
import { statusSchema, updateApplicationStatus } from "@/lib/applications";
import { extractAndSaveRequirements } from "@/lib/extract-job";
import { deleteJob } from "@/lib/jobs";

export async function deleteJobAction(formData: FormData) {
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return;

  await deleteJob(id.data);
  refresh();
}

const updateStatusInput = z.object({
  jobId: z.uuid(),
  status: statusSchema,
});

export async function updateStatusAction(formData: FormData) {
  const input = updateStatusInput.safeParse({
    jobId: formData.get("jobId"),
    status: formData.get("status"),
  });
  if (!input.success) return;

  await updateApplicationStatus(input.data.jobId, input.data.status);
  refresh();
}

export type ExtractState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "done"; count: number };

export async function extractRequirementsAction(
  _previous: ExtractState,
  formData: FormData,
): Promise<ExtractState> {
  const jobId = z.uuid().safeParse(formData.get("jobId"));
  if (!jobId.success) return { status: "error", message: "Unknown job." };

  try {
    const count = await extractAndSaveRequirements(jobId.data);
    if (count === null) return { status: "error", message: "Unknown job." };
    refresh();
    return { status: "done", count };
  } catch (error) {
    console.error("Requirement extraction failed:", error);
    return { status: "error", message: describeExtractionError(error) };
  }
}

function describeExtractionError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return "Hit Gemini's rate limit. Wait a minute and try again.";
    }
    if (error.status === 400 || error.status === 403) {
      return "Gemini rejected the request. Check GEMINI_API_KEY in .env.local.";
    }
  }
  if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
    return error.message;
  }
  return "Couldn't extract requirements. Try again in a moment.";
}
