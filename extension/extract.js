// Runs inside the job page via chrome.scripting.executeScript, so it has to
// be self-contained: no references to anything outside this function.
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- called from popup.js
function extractJobPosting() {
  const LIMITS = { title: 200, company: 200, location: 200, description: 50000 };

  const clean = (text) => (text ?? "").replace(/\s+/g, " ").trim();

  const tidy = (text) =>
    (text ?? "")
      .replace(/[^\S\n]+/g, " ") // any whitespace but newlines, incl. &nbsp;
      .replace(/ *\n */g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

  // DOMParser documents are inert: no scripts run and no images load.
  const htmlToText = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc
      .querySelectorAll("br, p, li, div, h1, h2, h3, h4, h5, h6")
      .forEach((el) => el.append("\n"));
    return tidy(doc.body.textContent);
  };

  const meta = (property) =>
    document.querySelector(`meta[property="${property}"], meta[name="${property}"]`)
      ?.content;

  // Most job boards (Greenhouse, Lever, Workday, LinkedIn, ...) embed a
  // schema.org JobPosting as JSON-LD. Prefer it when it's there.
  const findJobPosting = (node) => {
    if (!node || typeof node !== "object") return null;
    if (Array.isArray(node)) {
      for (const item of node) {
        const found = findJobPosting(item);
        if (found) return found;
      }
      return null;
    }
    const type = node["@type"];
    if (type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"))) {
      return node;
    }
    return findJobPosting(node["@graph"]);
  };

  let posting = null;
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      posting = findJobPosting(JSON.parse(script.textContent));
    } catch {
      // Ignore malformed JSON-LD and keep looking.
    }
    if (posting) break;
  }

  const formatLocation = (job) => {
    if (job.jobLocationType === "TELECOMMUTE") return "Remote";
    return [job.jobLocation]
      .flat()
      .filter(Boolean)
      .map((place) => {
        const address = place.address ?? {};
        if (typeof address === "string") return address;
        return [address.addressLocality, address.addressRegion].filter(Boolean).join(", ");
      })
      .filter(Boolean)
      .join(" · ");
  };

  // Fallbacks for pages without JSON-LD. Page titles are often
  // "Software Engineer at Acme" or "Job Application for ... at Acme | Board".
  const companyFromTitle = () =>
    document.title.match(/\bat\s+(.+?)(?:\s+[|·–—-]\s+.*)?$/)?.[1];

  const locationFromPage = () =>
    [...document.querySelectorAll('[class*="location" i]')]
      .map((el) => clean(el.textContent))
      .find((text) => text && text.length <= 100);

  // Pick the biggest "description" block so short form hints don't win.
  const descriptionFromPage = () => {
    const blocks = [...document.querySelectorAll('[class*="description" i]')]
      .map((el) => tidy(el.innerText))
      .sort((a, b) => b.length - a.length);
    if (blocks[0]?.length >= 200) return blocks[0];
    return tidy((document.querySelector("main, article") ?? document.body).innerText);
  };

  const organization = posting?.hiringOrganization;

  const title = clean(
    posting?.title ||
      meta("og:title") ||
      document.querySelector("h1")?.textContent ||
      document.title,
  );
  const company = clean(
    (typeof organization === "string" ? organization : organization?.name) ||
      meta("og:site_name") ||
      companyFromTitle() ||
      location.hostname.replace(/^www\./, ""),
  );
  const jobLocation = clean(
    (posting && formatLocation(posting)) || locationFromPage(),
  );
  const description = posting?.description
    ? htmlToText(posting.description)
    : descriptionFromPage();

  return {
    url: location.href,
    title: title.slice(0, LIMITS.title),
    company: company.slice(0, LIMITS.company),
    location: jobLocation.slice(0, LIMITS.location),
    description: description.slice(0, LIMITS.description),
  };
}
