import { expect, test } from "vitest";
import { EMAIL_COLORS, emailLayout, SYSTEM_FONT } from "@sharadox/email-web-library/email-layout";
import type { EmailContent, EmailDesign } from "@sharadox/email-web-library/email-layout/type";

const design: EmailDesign = {
  name: "Acme & Co",
  logo: { width: 30, height: 30 },
  wordmark: true,
  color: "#8d6a2b",
  fonts: { heading: "Georgia, serif", body: "Geist, sans-serif" },
  signature: [{ text: "acme.com", href: "https://acme.com" }],
};

const content: EmailContent = {
  language: "en",
  preview: "Ana sent a message",
  eyebrow: "Contact",
  heading: "Ana <Villa Mar>",
  paragraphs: ["Thanks for writing."],
  rows: [
    { label: "Name", value: "Ana" },
    { label: "Email", value: "ana@example.com", href: "mailto:ana@example.com" },
  ],
  quote: { label: "Message", text: "Hello\nthere" },
  button: { label: "Reply to Ana", href: "mailto:ana@example.com" },
  footer: [{ label: "Page", value: "https://example.com/en", href: "https://example.com/en" }],
};

test("lays out everything given, escaped: the logo and name at the top left, the brand's color on what's its", () => {
  const html = emailLayout(content, design, true);
  expect(html).toContain('<html lang="en">');
  expect(html).toContain('<img src="cid:logo" width="30" height="30" alt="Acme &amp; Co"');
  expect(html).toContain('color:#8d6a2b">Acme &amp; Co</td>');
  expect(html).toContain("Ana &lt;Villa Mar&gt;");
  expect(html).not.toContain("<Villa Mar>");
  expect(html).toMatch(/<h1 style="[^"]*font-family:Georgia, serif;[^"]*color:#8d6a2b">/);
  expect(html).toContain('letter-spacing:0.08em;text-transform:uppercase;color:#8d6a2b">Contact</div>');
  expect(html).toContain("Thanks for writing.");
  expect(html).toContain('href="mailto:ana@example.com"');
  expect(html).toContain("Hello\nthere");
  expect(html).toContain("border-left:3px solid #8d6a2b");
  expect(html).toContain("background-color:#8d6a2b;border-radius:8px");
  expect(html).toContain("color:#ffffff;text-decoration:none");
  expect(html).toContain(">Reply to Ana</a>");
  expect(html).toContain('Page: <a href="https://example.com/en"');
  expect(html).toContain('<a href="https://acme.com"');
  expect(html).toContain("Ana sent a message");
});

test("is black on white with every style inline: nothing for a mail app to drop or recolor differently", () => {
  const html = emailLayout(content, design, true);
  expect(html).toContain(`background-color:${EMAIL_COLORS.background}`);
  expect(html).not.toContain("<style");
  expect(html).not.toContain("color-scheme");
  expect(html).not.toContain("gradient(");
});

test("without a logo it writes the name in the brand's color; fonts and the button's words have defaults", () => {
  const plain: EmailDesign = { name: "Plain", color: "#000000", onColor: "#fafafa" };
  const html = emailLayout(
    { language: "pt", preview: "P", eyebrow: "E", heading: "H", button: { label: "B", href: "https://x.pt" } },
    plain,
    true,
  );
  expect(html).not.toContain("cid:logo");
  expect(html).toContain(">Plain</td>");
  expect(html).toContain(`font-family:${SYSTEM_FONT}`);
  expect(html).toContain("color:#fafafa;text-decoration:none");
  expect(html).not.toContain("<p style");
  // Headings take the body's font when they have none of their own.
  expect(emailLayout(content, { ...plain, fonts: { body: "Inter" } }, false)).toMatch(
    /<h1 style="margin:0;font-family:Inter;/,
  );
  // A logo it doesn't carry isn't drawn, and without wordmark a carried logo stands alone.
  expect(emailLayout(content, { ...design, wordmark: false }, false)).toContain(">Acme &amp; Co</td>");
  const alone = emailLayout(content, { ...design, wordmark: false }, true);
  expect(alone).toContain("cid:logo");
  expect(alone).not.toContain(">Acme &amp; Co</td>");
});

test("puts the signature right after the content when there's no small print", () => {
  const html = emailLayout({ ...content, footer: [], rows: [], quote: undefined }, design, false);
  expect(html).toContain("padding:36px 0 0;font-family:Geist");
  expect(html).not.toContain("Page:");
  expect(emailLayout({ ...content, button: undefined }, design, false)).not.toContain("border-radius:8px");
  expect(emailLayout({ ...content }, { ...design, signature: [] }, false)).not.toContain("acme.com");
});
