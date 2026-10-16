import { describe, expect, it } from "vitest";
import { saveJobSchema } from "./jobs";

const validJob = {
  url: "https://jobs.lever.co/acme/123",
  company: "Acme",
  title: "Software Engineer Intern",
  location: "Boston, MA",
  description: "Build things with TypeScript.",
};

describe("saveJobSchema", () => {
  it("accepts a valid job", () => {
    expect(saveJobSchema.parse(validJob)).toEqual(validJob);
  });

  it("trims whitespace from text fields", () => {
    const parsed = saveJobSchema.parse({
      ...validJob,
      company: "  Acme  ",
      title: "\nSoftware Engineer Intern ",
    });
    expect(parsed.company).toBe("Acme");
    expect(parsed.title).toBe("Software Engineer Intern");
  });

  it("treats a missing or blank location as undefined", () => {
    const withoutLocation: Partial<typeof validJob> = { ...validJob };
    delete withoutLocation.location;
    expect(saveJobSchema.parse(withoutLocation).location).toBeUndefined();
    expect(
      saveJobSchema.parse({ ...validJob, location: "   " }).location,
    ).toBeUndefined();
  });

  it.each(["company", "title", "description"] as const)(
    "rejects a blank %s",
    (field) => {
      const result = saveJobSchema.safeParse({ ...validJob, [field]: "   " });
      expect(result.success).toBe(false);
    },
  );

  it.each([
    "not a url",
    "javascript:alert(1)",
    "ftp://example.com/job",
    "file:///etc/passwd",
  ])("rejects the url %s", (url) => {
    expect(saveJobSchema.safeParse({ ...validJob, url }).success).toBe(false);
  });

  it("rejects a description over 50,000 characters", () => {
    const result = saveJobSchema.safeParse({
      ...validJob,
      description: "a".repeat(50_001),
    });
    expect(result.success).toBe(false);
  });
});
