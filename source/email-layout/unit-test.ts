import { expect, test } from "vitest";
import { EMAIL_COLORS, EMAIL_FONT, EMAIL_SPACES, emailLayout } from "@sharadox/email-web-library/email-layout";
import type { EmailContent, EmailDesign } from "@sharadox/email-web-library/email-layout/type";

const design: EmailDesign = {
  name: "Acme & Co",
  logo: { width: 30, height: 30 },
  wordmark: true,
  signature: [{ text: "acme.com", href: "https://acme.com" }, { text: "Lisbon" }],
};

const content: EmailContent = {
  language: "en",
  preview: "Ana sent a message",
  eyebrow: "Contact",
  heading: "Thank you, Ana <Sá>.",
  paragraphs: ["Your message has reached us.", "Feel free to reply."],
  rows: [
    { label: "Name", value: "Ana" },
    { label: "Email", value: "ana@example.com", href: "mailto:ana@example.com" },
    { label: "Needs", value: ["Website", "Hosting"] },
    { label: "Message", value: "Hello\nthere", keepLines: true },
  ],
  closing: "Best regards,",
};

test("lays out everything given, escaped, in a centered column 600 pixels wide with no background", () => {
  const html = emailLayout(content, design, { light: true, dark: true });
  expect(html).toContain('<html lang="en">');
  expect(html).toContain(
    ' width="600" align="center" style="border-collapse:collapse;width:100%;max-width:600px;margin:0 auto"',
  );
  expect(html).toContain('<td style="padding:16px">');
  expect(html).toContain('<img src="cid:logo" width="30" height="30" alt="Acme &amp; Co"');
  expect(html).toContain(">Acme &amp; Co</td>");
  expect(html).toContain("Thank you, Ana &lt;Sá&gt;.");
  expect(html).not.toContain("<Sá>");
  expect(html).toContain("Ana sent a message");
  expect(html).not.toContain("background");
  expect(html).toContain(`font-family:${EMAIL_FONT}`);
  expect(EMAIL_FONT.startsWith("Geist,")).toBe(true);
});

test("draws the heading, values, company's name and site strong, the labels and the rest soft", () => {
  const html = emailLayout(content, design, false);
  expect(html).toMatch(/<h1 class="strong" style="[^"]*color:#000000">/);
  expect(html).toContain('text-transform:uppercase;color:#5E5E5E">Contact</div>');
  expect(html).toContain('text-transform:uppercase;color:#5E5E5E">Name</div>');
  expect(html).toMatch(/<p class="soft" style="[^"]*color:#5E5E5E">Your message has reached us\.<\/p>/);
  expect(html).toContain('<a class="strong" href="mailto:ana@example.com" style="color:#000000;');
  expect(html).toContain('Best regards,<br><b class="strong" style="color:#000000">Acme &amp; Co</b>.</p>');
  expect(html).toContain(
    '<a class="strong" href="https://acme.com" style="color:#000000;text-decoration:underline">acme.com</a> &middot; Lisbon',
  );
});

test("shows a list a dot per line, keeps a message's line breaks, and draws lines only between details", () => {
  const html = emailLayout(content, design, false);
  expect(html).toContain("&bull;&nbsp;Website<br>&bull;&nbsp;Hosting");
  expect(html).toContain('white-space:pre-wrap;color:#000000">Hello\nthere</div>');
  expect(html.match(/border-top:1px solid #E4E4E7/g)).toHaveLength(3);
  expect(html).not.toContain("border-left");
});

test("uses only the spaces 4, 8, 16 and 32", () => {
  const html = emailLayout(content, design, { light: true, dark: true });
  const spaces = new Set([...html.matchAll(/padding(?:-top)?:(\d+)px/g)].map((match) => Number(match[1])));
  expect([...spaces].every((space) => (Object.values(EMAIL_SPACES) as number[]).includes(space))).toBe(true);
});

test("turns white and light gray in a dark theme, where the mail app honors it, Outlook.com included", () => {
  const html = emailLayout(content, design, { light: true, dark: true });
  expect(html).toContain('<meta name="color-scheme" content="light dark">');
  expect(html).toContain(`@media (prefers-color-scheme:dark){.strong{color:${EMAIL_COLORS.dark.strong}!important}`);
  expect(html).toContain(".soft{color:#A1A1A1!important}");
  expect(html).toContain("[data-ogsc] .strong{color:#FFFFFF!important}");
  expect(html).toContain(
    '<div class="logo-dark" style="display:none;max-height:0;overflow:hidden;mso-hide:all"><img src="cid:logo-dark"',
  );
  expect(html).toContain(".logo-light{display:none!important}.logo-dark{display:block!important");
});

test("without a logo it writes the name; a logo it doesn't carry isn't drawn; without wordmark it stands alone", () => {
  const html = emailLayout({ language: "pt", preview: "P", eyebrow: "E", heading: "H" }, { name: "Plain" }, true);
  expect(html).not.toContain("cid:logo");
  expect(html).toContain(">Plain</td>");
  expect(html).not.toContain("<p class");
  expect(html).not.toContain('class="line"');
  expect(emailLayout(content, { ...design, wordmark: false }, false)).toContain(">Acme &amp; Co</td>");
  const alone = emailLayout(content, { ...design, wordmark: false }, true);
  expect(alone).toContain("cid:logo");
  expect(alone).not.toContain("cid:logo-dark");
  expect(alone).not.toContain(">Acme &amp; Co</td>");
});

test("signs off right after the heading when there are no details, and leaves out what isn't given", () => {
  const html = emailLayout({ ...content, rows: [], paragraphs: [] }, design, false);
  expect(html).toContain('<td style="padding:32px 0 0"><p class="soft"');
  expect(emailLayout({ ...content, closing: undefined }, design, false)).not.toContain("Best regards");
  expect(emailLayout(content, { ...design, signature: [] }, false)).not.toContain("acme.com");
});
