"use server";

import { refresh } from "next/cache";
import { resumeContentSchema, saveResume } from "@/lib/resume";

export type SaveResumeState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "saved"; removed: { emails: number; phones: number } };

export async function saveResumeAction(
  _previous: SaveResumeState,
  formData: FormData,
): Promise<SaveResumeState> {
  const content = resumeContentSchema.safeParse(formData.get("content"));
  if (!content.success) {
    return {
      status: "error",
      message: "Paste your resume text (up to 50,000 characters).",
    };
  }

  const removed = await saveResume(content.data);
  refresh();
  return { status: "saved", removed };
}
