import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Job } from "@/db/schema";
import { saveJob } from "@/lib/jobs";
import { POST } from "./route";

// Keep the real validation schema, but don't touch the database.
vi.mock("@/lib/jobs", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/jobs")>()),
  saveJob: vi.fn(),
}));

const validJob = {
  url: "https://jobs.lever.co/acme/123",
  company: "Acme",
  title: "Software Engineer Intern",
  description: "Build things with TypeScript.",
};

const savedJob: Job = {
  ...validJob,
  id: "6ff77fbf-966b-4e80-be3a-72dc7544e93e",
  location: null,
  createdAt: new Date("2026-10-15T00:00:00Z"),
  updatedAt: new Date("2026-10-15T00:00:00Z"),
};

function postJson(body: unknown, contentType = "application/json") {
  return POST(
    new Request("http://localhost/api/jobs", {
      method: "POST",
      headers: { "Content-Type": contentType },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("POST /api/jobs", () => {
  beforeEach(() => {
    vi.mocked(saveJob).mockReset();
  });

  it("returns 201 when a new job is saved", async () => {
    vi.mocked(saveJob).mockResolvedValue({ job: savedJob, created: true });

    const response = await postJson(validJob);

    expect(response.status).toBe(201);
    expect((await response.json()).job.id).toBe(savedJob.id);
    expect(saveJob).toHaveBeenCalledWith(validJob);
  });

  it("returns 200 when the job was already saved", async () => {
    vi.mocked(saveJob).mockResolvedValue({ job: savedJob, created: false });

    const response = await postJson(validJob);

    expect(response.status).toBe(200);
  });

  it("returns 400 with field errors for an invalid job", async () => {
    const response = await postJson({ ...validJob, company: "", url: "nope" });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(Object.keys(body.fields)).toEqual(
      expect.arrayContaining(["company", "url"]),
    );
    expect(saveJob).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await postJson("{not json");

    expect(response.status).toBe(400);
    expect(saveJob).not.toHaveBeenCalled();
  });

  it("returns 415 for a non-JSON body", async () => {
    const response = await postJson("url=x", "application/x-www-form-urlencoded");

    expect(response.status).toBe(415);
    expect(saveJob).not.toHaveBeenCalled();
  });
});
