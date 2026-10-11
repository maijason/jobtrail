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
- Postgres (planned)
- Chrome extension, Manifest V3 (planned)

## Running locally

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## License

MIT
