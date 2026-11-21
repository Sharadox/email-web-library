import { expect, test } from "vitest";
import { EMAIL_COLORS, EMAIL_FONT, emailLayout } from "@sharadox/email-web-library/email-layout";
import type { EmailContent, EmailDesign } from "@sharadox/email-web-library/email-layout/type";

const design: EmailDesign = {
  name: "Acme & Co",
  logo: { width: 30, height: 30 },
  wordmark: true,
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

test("lays out everything given, escaped, in black on no background, in Geist or the device's own sans", () => {
  const html = emailLayout(content, design, { light: true, dark: true });
  expect(html).toContain('<html lang="en">');
  expect(html).toContain('<img src="cid:logo" width="30" height="30" alt="Acme &amp; Co"');
  expect(html).toContain(">Acme &amp; Co</td>");
  expect(html).toContain("Ana &lt;Villa Mar&gt;");
  expect(html).not.toContain("<Villa Mar>");
  expect(html).toMatch(/<h1 class="text" style="[^"]*color:#000000">/);
  expect(html).toContain("Thanks for writing.");
  expect(html).toContain('href="mailto:ana@example.com"');
  expect(html).toContain('class="button" style="background-color:#000000;border-radius:8px"');
  expect(html).toContain(">Reply to Ana</a>");
  expect(html).toContain('Page: <a class="quiet" href="https://example.com/en"');
  expect(html).toContain('<a class="quiet" href="https://acme.com"');
  expect(html).toContain("Ana sent a message");
  expect(html).toContain(`font-family:${EMAIL_FONT}`);
  expect(EMAIL_FONT.startsWith("Geist,")).toBe(true);
  // No background anywhere but the button's (and its dark rule's).
  expect(html.match(/background-color:/g)).toHaveLength(3);
});

test("shows the message as the last detail, alike the others, keeping its line breaks", () => {
  const html = emailLayout(content, design, false);
  expect(html.match(/<td class="line" style="padding:14px 0;/g)).toHaveLength(3);
  expect(html).toContain(
    '>Message</div><div class="text" style="padding-top:4px;font-size:16px;line-height:1.5;color:#000000;white-space:pre-wrap">Hello\nthere</div>',
  );
  expect(html).not.toContain("border-left");
});

test("turns white in a dark theme, where the mail app honors it, Outlook.com included, with the white logo", () => {
  const html = emailLayout(content, design, { light: true, dark: true });
  expect(html).toContain('<meta name="color-scheme" content="light dark">');
  expect(html).toContain(`@media (prefers-color-scheme:dark){.text{color:${EMAIL_COLORS.dark.text}!important}`);
  expect(html).toContain("[data-ogsc] .text{color:#ffffff!important}");
  expect(html).toContain(".button{background-color:#ffffff!important}.button-text{color:#000000!important}");
  expect(html).toContain(
    '<div class="logo-dark" style="display:none;max-height:0;overflow:hidden;mso-hide:all"><img src="cid:logo-dark"',
  );
  expect(html).toContain(".logo-light{display:none!important}.logo-dark{display:block!important");
});

test("without a logo it writes the name; a logo it doesn't carry isn't drawn; without wordmark it stands alone", () => {
  const html = emailLayout(
    { language: "pt", preview: "P", eyebrow: "E", heading: "H", button: { label: "B", href: "https://x.pt" } },
    { name: "Plain" },
    true,
  );
  expect(html).not.toContain("cid:logo");
  expect(html).toContain(">Plain</td>");
  expect(html).not.toContain("<p class");
  expect(html).not.toContain('<td class="line"');
  expect(emailLayout(content, { ...design, wordmark: false }, false)).toContain(">Acme &amp; Co</td>");
  const alone = emailLayout(content, { ...design, wordmark: false }, true);
  expect(alone).toContain("cid:logo");
  expect(alone).not.toContain("cid:logo-dark");
  expect(alone).not.toContain(">Acme &amp; Co</td>");
});

test("puts the signature right after the content when there's no small print, and leaves out what isn't given", () => {
  const html = emailLayout({ ...content, footer: [], rows: [], quote: undefined }, design, false);
  expect(html).toContain('<td style="padding:36px 0 0"><div class="quiet"');
  expect(html).not.toContain("Page:");
  expect(emailLayout({ ...content, button: undefined }, design, false)).not.toContain('class="button"');
  expect(emailLayout(content, { ...design, signature: [] }, false)).not.toContain("acme.com");
});
