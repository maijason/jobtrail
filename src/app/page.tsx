const features = [
  {
    title: "Save postings in one click",
    body: "A browser extension grabs the company, role, and description from the job page you're on.",
  },
  {
    title: "See exactly why you match",
    body: "Each requirement is marked met, partial, or missing, with the line from your resume that backs it up.",
  },
  {
    title: "Track every application",
    body: "Move applications from saved to applied to interview on a single board.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-24">
      <p className="text-sm font-medium text-zinc-500">Work in progress</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">JobTrail</h1>
      <p className="mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
        An open-source job hunt tracker that shows you why you match a role,
        and keeps your data yours.
      </p>

      <ul className="mt-12 grid gap-6 sm:grid-cols-3">
        {features.map((feature) => (
          <li
            key={feature.title}
            className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800"
          >
            <h2 className="font-medium">{feature.title}</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {feature.body}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
