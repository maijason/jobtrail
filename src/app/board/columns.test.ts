import { describe, expect, it } from "vitest";
import type { JobListItem } from "@/lib/jobs";
import { applyMove, groupByStatus } from "./columns";

function job(id: string, status: JobListItem["status"]): JobListItem {
  return {
    id,
    status,
    url: `https://example.com/${id}`,
    company: "Acme",
    title: `Job ${id}`,
    location: null,
    savedAt: new Date("2026-10-21T00:00:00Z"),
  };
}

describe("applyMove", () => {
  it("changes only the moved job's status", () => {
    const jobs = [job("a", "saved"), job("b", "saved")];
    const moved = applyMove(jobs, { id: "a", status: "applied" });

    expect(moved.map((j) => j.status)).toEqual(["applied", "saved"]);
    expect(jobs[0].status).toBe("saved"); // original list is untouched
  });

  it("ignores an unknown id", () => {
    const jobs = [job("a", "saved")];
    expect(applyMove(jobs, { id: "zzz", status: "offer" })).toEqual(jobs);
  });
});

describe("groupByStatus", () => {
  it("puts each job in its column and keeps empty columns", () => {
    const columns = groupByStatus(
      [job("a", "saved"), job("b", "applied"), job("c", "saved")],
      ["saved", "applied", "offer"],
    );

    expect([...columns.keys()]).toEqual(["saved", "applied", "offer"]);
    expect(columns.get("saved")?.map((j) => j.id)).toEqual(["a", "c"]);
    expect(columns.get("applied")?.map((j) => j.id)).toEqual(["b"]);
    expect(columns.get("offer")).toEqual([]);
  });
});
