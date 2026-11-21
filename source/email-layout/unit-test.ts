import { expect, test } from "vitest";
import { emailLayout, ownColor } from "@sharadox/email-web-library/email-layout";
import type { EmailContent, EmailDesign } from "@sharadox/email-web-library/email-layout/type";

const design: EmailDesign = {
  name: "Acme & Co",
  logo: { width: 30, height: 30 },
  wordmark: true,
  align: "left",
  colors: {
    page: "#000002",
    card: "#000002",
    edge: "#262628",
    text: "#fffffd",
    muted: "#a3a3a5",
    quiet: "#737375",
    rule: "#2e2e30",
    accent: "#fffffd",
    box: "#0a0a0c",
    onAccent: "#000002",
  },
  fonts: { heading: "Geist, sans-serif", body: "Geist, sans-serif", label: "monospace" },
  heading: { size: 34, weight: 600, letterSpacing: "-0.04em", lineHeight: 1.1 },
  label: { size: 11, letterSpacing: "0.06em" },
  rule: "dashed",
  radius: 0,
  button: { radius: 999, uppercase: false, letterSpacing: "0" },
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

test("lays out everything given in the design, escaped, with the logo and the name beside it", () => {
  const html = emailLayout(content, design, true);
  expect(html).toContain('<html lang="en">');
  expect(html).toContain('<img src="cid:logo" width="30" height="30" alt="Acme &amp; Co"');
  expect(html).toContain(">Acme &amp; Co</td>");
  expect(html).toContain("Ana &lt;Villa Mar&gt;");
  expect(html).not.toContain("<Villa Mar>");
  expect(html).toContain("Thanks for writing.");
  expect(html).toContain('href="mailto:ana@example.com"');
  expect(html).toContain("border-top:1px dashed #2e2e30");
  expect(html).toContain("Hello\nthere");
  expect(html).toContain(">Reply to Ana</a>");
  expect(html).toContain('Page: <a href="https://example.com/en"');
  // A plain card: no frame lines, no marks, no gradient, no signature.
  expect(html).toContain("border:1px solid #262628;border-radius:0px");
  expect(html).not.toContain(">+</td>");
  expect(html).not.toContain("background-image");
  expect(html).not.toContain("white-space:nowrap");
  // Phones get the narrower layout.
  expect(html).toContain("@media (max-width:520px)");
});

test("draws a grid's frame with marks, a gold gradient, a centered mark alone, and the company's signature", () => {
  const html = emailLayout(
    { language: "pt", preview: "Uma mensagem", eyebrow: "Marcação", heading: "Ana" },
    {
      ...design,
      wordmark: false,
      align: "center",
      crosses: true,
      eyebrowLine: true,
      quoteBar: true,
      rule: "solid",
      colors: {
        ...design.colors,
        accentGradient: "linear-gradient(115deg, #7a5a22, #f6e3a8)",
        headerRule: "linear-gradient(90deg, #000, #c9a24e, #000)",
      },
      signature: [{ text: "Upholstery & interiors" }, { text: "example.com", href: "https://example.com" }],
    },
    true,
  );
  expect(html.match(/>\+<\/td>/g)).toHaveLength(4);
  expect(html).toContain("border-right:1px solid #262628");
  expect(html).not.toContain(">Acme &amp; Co</td>");
  expect(html).toContain("margin:0 auto");
  // The gradient over the accent, for clients that drop gradients.
  expect(html).toContain("background-color:#fffffd;background-image:linear-gradient(90deg, #000, #c9a24e, #000)");
  expect(html).toContain("background-image:linear-gradient(115deg, #7a5a22, #f6e3a8)");
  expect(html).toContain("Upholstery &amp; interiors");
  expect(html).toContain('<a href="https://example.com"');
  expect(html).not.toContain(
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;width:100%;margin:28px 0 0"',
  );
});

test("without a logo, or a design with no logo size, it writes the company's name instead", () => {
  const unsized: EmailDesign = { ...design, logo: undefined };
  for (const html of [emailLayout(content, design, false), emailLayout(content, unsized, true)]) {
    expect(html).not.toContain("cid:logo");
    expect(html).toContain(">Acme &amp; Co</td>");
  }
  expect(emailLayout(content, { ...design, quoteBar: true }, false)).toContain("border-left:2px solid #fffffd");
});

test("centers a centered design's button, writes it in capitals, and draws its own header rule", () => {
  const html = emailLayout(
    { ...content, button: { label: "Reply", href: "mailto:ana@example.com" } },
    {
      ...design,
      align: "center",
      button: { radius: 4, uppercase: true, letterSpacing: "0.18em" },
      colors: { ...design.colors, headerRule: "#c9a24e" },
    },
    true,
  );
  expect(html).toContain("margin:32px auto 0");
  expect(html).toContain("text-transform:uppercase;");
  expect(html).toContain("background-color:#c9a24e;");
});

test("says its colors are its own in light and dark, inside the body too, and gives a gradient rule its plain color", () => {
  const html = emailLayout(
    { language: "en", preview: "P", eyebrow: "E", heading: "H" },
    {
      ...design,
      colors: { ...design.colors, headerRule: "linear-gradient(90deg, #000, #3a3a3c)", headerRuleColor: "#3a3a3c" },
    },
    false,
  );
  expect(html).toContain('<meta name="color-scheme" content="light dark">');
  // Clients that drop the head still read the body's own copy.
  const body = html.slice(html.indexOf("<body"));
  expect(body).toContain(":root{color-scheme:light dark;supported-color-schemes:light dark}");
  expect(body).toContain(
    `@media (prefers-color-scheme:dark){body,.page{background-color:${design.colors.page}!important}}`,
  );
  expect(body).toContain("@media (max-width:520px)");
  expect(html).toContain("background-color:#3a3a3c;background-image:linear-gradient(90deg, #000, #3a3a3c)");
});

test("makes pure neutral colors its own, by a shade no eye can tell, and leaves tinted ones alone", () => {
  expect(ownColor("#000000")).toBe("#000002");
  expect(ownColor("#FFFFFF")).toBe("#fffffd");
  expect(ownColor("#262626")).toBe("#262628");
  expect(ownColor("#070605")).toBe("#070605");
  expect(ownColor("#c9a24e")).toBe("#c9a24e");
  expect(ownColor("transparent")).toBe("transparent");
  // A design given in pure neutrals comes out without any: mail apps that swap those for their theme's leave it be.
  const html = emailLayout(
    { language: "en", preview: "P", eyebrow: "E", heading: "H", button: { label: "B", href: "https://example.com" } },
    {
      ...design,
      colors: {
        ...design.colors,
        page: "#000000",
        accent: "#ffffff",
        headerRule: "linear-gradient(90deg, #000000, #3a3a3a)",
      },
    },
    false,
  );
  for (const neutral of ["#000000", "#ffffff", "#3a3a3a"]) expect(html).not.toContain(neutral);
  expect(html).toContain("background-image:linear-gradient(90deg, #000002, #3a3a3c)");
});
