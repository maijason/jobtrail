import { describe, expect, it } from "vitest";
import { nextAppliedAt, statusSchema } from "./applications";

const now = new Date("2026-10-18T12:00:00Z");
const earlier = new Date("2026-10-01T12:00:00Z");

describe("nextAppliedAt", () => {
  it.each(["applied", "interviewing", "offer", "rejected"] as const)(
    "sets the date the first time an application becomes %s",
    (status) => {
      expect(nextAppliedAt(status, null, now)).toEqual(now);
    },
  );

  it("keeps the original date as the application moves along", () => {
    expect(nextAppliedAt("interviewing", earlier, now)).toEqual(earlier);
    expect(nextAppliedAt("offer", earlier, now)).toEqual(earlier);
  });

  it("clears the date when moved back to saved", () => {
    expect(nextAppliedAt("saved", earlier, now)).toBeNull();
  });

  it("doesn't set a date when withdrawing before applying", () => {
    expect(nextAppliedAt("withdrawn", null, now)).toBeNull();
  });

  it("keeps the date when withdrawing after applying", () => {
    expect(nextAppliedAt("withdrawn", earlier, now)).toEqual(earlier);
  });
});

describe("statusSchema", () => {
  it("accepts every status in the database enum", () => {
    for (const status of statusSchema.options) {
      expect(statusSchema.safeParse(status).success).toBe(true);
    }
  });

  it("rejects anything else", () => {
    expect(statusSchema.safeParse("ghosted").success).toBe(false);
  });
});
