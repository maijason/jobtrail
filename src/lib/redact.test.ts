import { describe, expect, it } from "vitest";
import { redactContactInfo } from "./redact";

describe("redactContactInfo", () => {
  it("removes email addresses", () => {
    const result = redactContactInfo(
      "Contact: jane.doe+jobs@example.co.uk | other@school.edu",
    );
    expect(result.text).toBe("Contact: [email removed] | [email removed]");
    expect(result.removed.emails).toBe(2);
  });

  it.each([
    "617-555-0142",
    "(617) 555-0142",
    "617.555.0142",
    "6175550142",
    "+1 617 555 0142",
    "1-617-555-0142",
  ])("removes the phone number %s", (phone) => {
    const result = redactContactInfo(`Boston, MA | ${phone} | linkedin`);
    expect(result.text).toBe("Boston, MA | [phone removed] | linkedin");
    expect(result.removed.phones).toBe(1);
  });

  it.each([
    "June 2025 - August 2025",
    "2023 - 2027",
    "GPA: 3.8",
    "across 500,000+ transactions",
    "processing 15,000+ daily records",
    "cutting time 80% for 80,000+ confirmations",
    "Order ID 123456789012",
  ])("leaves %s alone", (text) => {
    expect(redactContactInfo(text)).toEqual({
      text,
      removed: { emails: 0, phones: 0 },
    });
  });

  it("handles a typical resume header", () => {
    const header =
      "Jane Doe\nU.S. Citizen | Boston, MA | 617-555-0142 | jane@example.com | linkedin.com/in/jane";
    expect(redactContactInfo(header)).toEqual({
      text: "Jane Doe\nU.S. Citizen | Boston, MA | [phone removed] | [email removed] | linkedin.com/in/jane",
      removed: { emails: 1, phones: 1 },
    });
  });
});
