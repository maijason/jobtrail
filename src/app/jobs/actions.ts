"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { statusSchema, updateApplicationStatus } from "@/lib/applications";
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
