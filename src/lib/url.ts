const TRACKING_PARAMS = new Set([
  "fbclid",
  "gclid",
  "gh_src",
  "lever-source",
  "ref",
  "refid",
  "source",
  "trackingid",
  "trk",
]);

/**
 * Normalize a job posting URL so the same posting saved from different
 * links (tracking params, #fragments, trailing slashes) maps to one row.
 */
export function normalizeJobUrl(raw: string): string {
  const url = new URL(raw);

  url.hash = "";
  url.hostname = url.hostname.toLowerCase();

  for (const key of [...url.searchParams.keys()]) {
    const lower = key.toLowerCase();
    if (lower.startsWith("utm_") || TRACKING_PARAMS.has(lower)) {
      url.searchParams.delete(key);
    }
  }
  url.searchParams.sort();

  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }

  return url.toString();
}
