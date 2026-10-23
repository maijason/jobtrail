CREATE TYPE "public"."match_verdict" AS ENUM('met', 'partial', 'missing');--> statement-breakpoint
CREATE TABLE "matches" (
	"requirement_id" uuid PRIMARY KEY NOT NULL,
	"verdict" "match_verdict" NOT NULL,
	"evidence" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_requirement_id_requirements_id_fk" FOREIGN KEY ("requirement_id") REFERENCES "public"."requirements"("id") ON DELETE cascade ON UPDATE no action;