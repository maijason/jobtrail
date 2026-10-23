import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const applicationStatus = pgEnum("application_status", [
  "saved",
  "applied",
  "interviewing",
  "offer",
  "rejected",
  "withdrawn",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

// A job posting as it appeared when it was saved.
export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull().unique(),
  company: text("company").notNull(),
  title: text("title").notNull(),
  location: text("location"),
  description: text("description").notNull(),
  ...timestamps,
});

// Where you are in the process for a given job. One per job.
export const applications = pgTable(
  "applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
      .notNull()
      .unique()
      .references(() => jobs.id, { onDelete: "cascade" }),
    status: applicationStatus("status").notNull().default("saved"),
    appliedAt: timestamp("applied_at", { withTimezone: true }),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [index("applications_status_idx").on(table.status)],
);

export const requirementKind = pgEnum("requirement_kind", [
  "required",
  "preferred",
]);

// A single requirement pulled out of a job's description.
export const requirements = pgTable(
  "requirements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    kind: requirementKind("kind").notNull(),
    text: text("text").notNull(),
    // Order the requirement appeared in the posting.
    position: integer("position").notNull(),
    createdAt: timestamps.createdAt,
  },
  (table) => [index("requirements_job_id_idx").on(table.jobId)],
);

export const matchVerdict = pgEnum("match_verdict", [
  "met",
  "partial",
  "missing",
]);

// How well your resume covers one requirement, with the line that shows it.
export const matches = pgTable("matches", {
  requirementId: uuid("requirement_id")
    .primaryKey()
    .references(() => requirements.id, { onDelete: "cascade" }),
  verdict: matchVerdict("verdict").notNull(),
  // An exact quote from the resume, checked before saving.
  evidence: text("evidence"),
  note: text("note"),
  createdAt: timestamps.createdAt,
});

export const resumes = pgTable("resumes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  ...timestamps,
});

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type Requirement = typeof requirements.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type Resume = typeof resumes.$inferSelect;
