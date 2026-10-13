import { z } from "zod";
import { saveJob, saveJobSchema } from "@/lib/jobs";

export async function POST(request: Request) {
  // Requiring JSON means a plain HTML form on another site can't post here.
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ error: "Expected a JSON body" }, { status: 415 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = saveJobSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: "Invalid job",
        fields: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  const { job, created } = await saveJob(parsed.data);
  return Response.json({ job }, { status: created ? 201 : 200 });
}
