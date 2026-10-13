import {
  index,
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

export const resumes = pgTable("resumes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  ...timestamps,
});

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type Resume = typeof resumes.$inferSelect;
