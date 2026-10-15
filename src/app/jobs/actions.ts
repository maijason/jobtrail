"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { deleteJob } from "@/lib/jobs";

export async function deleteJobAction(formData: FormData) {
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return;

  await deleteJob(id.data);
  refresh();
}
