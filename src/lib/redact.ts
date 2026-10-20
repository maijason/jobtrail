const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

// US-style numbers: 617-555-0142, (617) 555-0142, 617.555.0142, +1 617 555 0142.
// The lookarounds stop it from matching inside longer digit runs.
const PHONE = /(?<![\d+])(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}(?!\d)/g;

export type RedactionResult = {
  text: string;
  removed: { emails: number; phones: number };
};

/**
 * Strip email addresses and phone numbers from resume text before it's
 * stored or sent to an LLM. Matching doesn't need them. This is best-effort,
 * so the resume page still asks you to check what's left.
 */
export function redactContactInfo(input: string): RedactionResult {
  let emails = 0;
  let phones = 0;

  const text = input
    .replace(EMAIL, () => {
      emails++;
      return "[email removed]";
    })
    .replace(PHONE, () => {
      phones++;
      return "[phone removed]";
    });

  return { text, removed: { emails, phones } };
}
