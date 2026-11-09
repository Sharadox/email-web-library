import { describe, expect, it } from "vitest";
import { checkEmailMessage } from "./index.ts";
import type { EmailMessage } from "./type.ts";

const message: EmailMessage = {
  from: { name: "Website", address: "website@example.com" },
  to: "inbox@example.com",
  replyTo: "visitor@example.org",
  subject: "New enquiry",
  text: "Hello",
};

describe("checkEmailMessage", () => {
  it("passes a complete message through unchanged", () => {
    expect(checkEmailMessage(message)).toBe(message);
    expect(checkEmailMessage({ ...message, text: undefined, html: "<p>Hello</p>" })).toBeTruthy();
  });

  it.each<[string, Partial<EmailMessage>]>([
    ["a subject with a line break", { subject: "Hi\r\nBcc: victim@example.com" }],
    ["an empty subject", { subject: "  " }],
    ["no body", { text: "", html: undefined }],
    ["no recipients", { to: [] }],
    ["a bad reply address", { replyTo: "nobody" }],
    ["a bad recipient in a list", { to: ["inbox@example.com", "broken"] }],
  ])("rejects %s", (_, change) => {
    expect(() => checkEmailMessage({ ...message, ...change })).toThrow(
      expect.objectContaining({ code: "invalid-message" }),
    );
  });
});
