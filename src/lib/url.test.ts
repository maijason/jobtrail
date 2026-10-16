import { describe, expect, it } from "vitest";
import { normalizeJobUrl } from "./url";

describe("normalizeJobUrl", () => {
  it("removes utm and other tracking params", () => {
    expect(
      normalizeJobUrl(
        "https://jobs.lever.co/acme/123?utm_source=linkedin&utm_medium=social&trk=abc&lever-source=x",
      ),
    ).toBe("https://jobs.lever.co/acme/123");
  });

  it("matches tracking params case-insensitively", () => {
    expect(normalizeJobUrl("https://example.com/job?UTM_Source=x&RefId=y")).toBe(
      "https://example.com/job",
    );
  });

  it("keeps params that identify the job", () => {
    expect(
      normalizeJobUrl(
        "https://www.linkedin.com/jobs/view/?currentJobId=42&utm_source=share",
      ),
    ).toBe("https://www.linkedin.com/jobs/view?currentJobId=42");
  });

  it("sorts the remaining params so order doesn't matter", () => {
    expect(normalizeJobUrl("https://example.com/job?b=2&a=1")).toBe(
      normalizeJobUrl("https://example.com/job?a=1&b=2"),
    );
  });

  it("drops the #fragment", () => {
    expect(normalizeJobUrl("https://example.com/job/1#apply")).toBe(
      "https://example.com/job/1",
    );
  });

  it("lowercases the host but not the path", () => {
    expect(normalizeJobUrl("https://Boards.Greenhouse.IO/Acme/jobs/1")).toBe(
      "https://boards.greenhouse.io/Acme/jobs/1",
    );
  });

  it("removes a trailing slash but keeps the root path", () => {
    expect(normalizeJobUrl("https://example.com/jobs/1/")).toBe(
      "https://example.com/jobs/1",
    );
    expect(normalizeJobUrl("https://example.com/")).toBe("https://example.com/");
  });

  it("treats the same posting from different links as one URL", () => {
    const fromLinkedIn =
      "https://boards.greenhouse.io/acme/jobs/123/?gh_src=abc&utm_source=linkedin";
    const fromGoogle = "https://BOARDS.greenhouse.io/acme/jobs/123#content";
    expect(normalizeJobUrl(fromLinkedIn)).toBe(normalizeJobUrl(fromGoogle));
  });
});
