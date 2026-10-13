# JobTrail

[![CI](https://github.com/maijason/jobtrail/actions/workflows/ci.yml/badge.svg)](https://github.com/maijason/jobtrail/actions/workflows/ci.yml)

An open-source job hunt tracker that shows you why you match a role, and keeps your data yours.

> Early development. Things will change a lot.

## Why

Most job trackers give you a vague "87% match" score and keep your resume on their servers. JobTrail is meant to be different:

- **Explainable matching.** Every requirement in a posting is marked met, partial, or missing, with the resume line that supports it.
- **Your data stays yours.** Self-host it and bring your own LLM API key.

## Planned features

- [ ] Browser extension to save a job posting from the page you're on
- [ ] Extract required and nice-to-have skills from a posting
- [ ] Match requirements against your resume
- [ ] Board view for tracking application status
- [ ] Follow-up reminders

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Postgres + Drizzle ORM
- Chrome extension, Manifest V3 (planned)

## Data model

| Table | What it stores |
|---|---|
| `jobs` | A posting as it looked when you saved it: company, title, location, description, and URL (unique, so the same posting isn't saved twice) |
| `applications` | Your progress on a job: status (`saved` → `applied` → `interviewing` → `offer` / `rejected` / `withdrawn`), date applied, notes |
| `resumes` | Plain-text versions of your resume to match postings against |

Jobs and applications are separate on purpose. The posting is a snapshot of what the company wrote, and the application is what you're doing about it. Keeping them apart means requirement extraction and match results can attach to the job without mixing in tracking state.

The schema lives in [`src/db/schema.ts`](src/db/schema.ts), and SQL migrations are generated into [`drizzle/`](drizzle).

## Running locally

Requires Node.js 20+ and Docker.

```bash
npm install
cp .env.example .env.local
npm run db:up        # start Postgres in Docker
npm run db:migrate   # create the tables
npm run dev
```

Then open http://localhost:3000.

## License

MIT
