import { escapeHtml } from "@sharadox/web-library/html/escape";
import type { EmailContent, EmailDesign, EmailLogos } from "@sharadox/email-web-library/email-layout/type";

/**
 * The colors every email is drawn in: no background (the mail app's own shows), black text on a light theme and white
 * on a dark one, with grays between them for paragraphs, labels and lines.
 */
export const EMAIL_COLORS = {
  light: { text: "#000000", muted: "#3f3f46", quiet: "#71717a", line: "#e4e4e7" },
  dark: { text: "#ffffff", muted: "#d4d4d8", quiet: "#a1a1aa", line: "#3f3f46" },
} as const;

/** Geist where the reader has it, the device's own sans otherwise. */
export const EMAIL_FONT = "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const { light, dark } = EMAIL_COLORS;

/** The dark theme's rules, one selector per element role. */
const DARK = `.text{color:${dark.text}!important}.muted{color:${dark.muted}!important}.quiet{color:${dark.quiet}!important}.line{border-color:${dark.line}!important}.button{background-color:${dark.text}!important}.button-text{color:#000000!important}.logo-light{display:none!important}.logo-dark{display:block!important;max-height:none!important;overflow:visible!important}`;

/**
 * The dark theme, for mail apps that honor it (Apple Mail, Outlook on phones and Macs, and others): white text, light
 * grays, dark lines, a white button with black words, and the white logo instead of the black one. Said again for
 * Outlook.com, which marks its dark theme with a `data-ogsc` attribute. Mail apps that ignore it darken the email
 * their own way, which the black logo's white outline survives.
 */
const DARK_RULES = `@media (prefers-color-scheme:dark){${DARK}}${DARK.replace(/(^|\})\./g, "$1[data-ogsc] .")}`;

/** A table that's only there for layout, as email clients need. */
const table = (style: string, rows: string, width?: number) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0"${width ? ` width="${width}"` : ""} style="border-collapse:collapse;${style}">${rows}</table>`;

/** The font, on everything. */
const FONT = `font-family:${EMAIL_FONT}`;

/** Small spaced capitals in one of the theme's colors: eyebrows and labels. */
const capitals = (color: "text" | "quiet") =>
  `class="${color}" style="${FONT};font-size:12px;font-weight:600;line-height:1.5;letter-spacing:0.08em;text-transform:uppercase;color:${light[color]}"`;

/** A value, as a link when it has one. */
const value = ({ value: text, href }: { value: string; href?: string | undefined }, color: "text" | "quiet") =>
  href
    ? `<a class="${color}" href="${escapeHtml(href)}" style="color:${light[color]};text-decoration:underline">${escapeHtml(text)}</a>`
    : escapeHtml(text);

/** The logo: the black one, and the white one for dark themes, hidden unless a dark theme shows it. */
function mark(design: EmailDesign, logos: EmailLogos) {
  if (!logos.light || !design.logo) return "";
  const { width, height } = design.logo;
  const image = (id: string) =>
    `<img src="cid:${id}" width="${width}" height="${height}" alt="${escapeHtml(design.name)}" style="display:block;width:${width}px;height:${height}px;border:0">`;
  const darkLogo = logos.dark
    ? `<div class="logo-dark" style="display:none;max-height:0;overflow:hidden;mso-hide:all">${image("logo-dark")}</div>`
    : "";
  return `<td style="vertical-align:middle;padding:0${design.wordmark ? " 10px 0 0" : ""}"><div class="logo-light">${image("logo")}</div>${darkLogo}</td>`;
}

/** The logo at the top left, and the company's name beside it with `wordmark` (or alone, without a logo). */
function header(design: EmailDesign, logos: EmailLogos) {
  const logo = mark(design, logos);
  const name =
    design.wordmark || !logo
      ? `<td class="text" style="vertical-align:middle;${FONT};font-size:19px;font-weight:700;letter-spacing:-0.01em;color:${light.text}">${escapeHtml(design.name)}</td>`
      : "";
  return table("", `<tr>${logo}${name}</tr>`);
}

/** The details, each label over its value, lines between them; a longer text keeps its line breaks. */
function details(entries: readonly { label: string; inside: string; keepLines?: boolean }[]) {
  const line = `class="line" style="padding:14px 0;border-top:1px solid ${light.line};${FONT};word-break:break-word"`;
  return table(
    "width:100%",
    entries
      .map(
        (entry) =>
          `<tr><td ${line}><div ${capitals("quiet")}>${escapeHtml(entry.label)}</div><div class="text" style="padding-top:4px;font-size:16px;line-height:1.5;color:${light.text}${entry.keepLines ? ";white-space:pre-wrap" : ""}">${entry.inside}</div></td></tr>`,
      )
      .join("") +
      `<tr><td class="line" style="border-top:1px solid ${light.line};font-size:0;line-height:0">&nbsp;</td></tr>`,
  );
}

/**
 * An email that looks the same in every inbox: the logo at the top left, an eyebrow and a heading, paragraphs, the
 * details (each label over its value, a longer text last, all alike), one button, small print and the company's
 * signature. No background: the mail app's own shows, with the text, logo and button in the theme's foreground
 * color (black, or white in dark mode where the app honors it). Geist where the reader has it, the device's own sans
 * otherwise. Every style is inline but the dark theme's; everything given is escaped. `logos` says which logo images
 * the email carries (`true`: the black one only).
 *
 * @example
 * emailLayout({ language: "en", preview: "Ana sent a message", eyebrow: "Contact", heading: "Ana",
 *   rows: [{ label: "Email", value: "ana@example.com" }] }, { name: "Acme" }, false);
 */
export function emailLayout(content: EmailContent, design: EmailDesign, logos: EmailLogos | boolean): string {
  const carried = typeof logos === "boolean" ? { light: logos, dark: false } : logos;
  const { language, preview, eyebrow, heading, paragraphs = [], rows = [], quote, button, footer = [] } = content;
  const block = (style: string, inside: string) => `<tr><td style="${style}">${inside}</td></tr>`;
  const entries = [
    ...rows.map((row) => ({ label: row.label, inside: value(row, "text") })),
    ...(quote ? [{ label: quote.label, inside: escapeHtml(quote.text), keepLines: true }] : []),
  ];
  const parts = [
    block("padding:0 0 36px", header(design, carried)),
    block("padding:0 0 10px", `<div ${capitals("text")}>${escapeHtml(eyebrow)}</div>`),
    block(
      "padding:0",
      `<h1 class="text" style="margin:0;${FONT};font-size:30px;font-weight:700;line-height:1.2;letter-spacing:-0.01em;color:${light.text}">${escapeHtml(heading)}</h1>`,
    ),
    ...paragraphs.map((paragraph) =>
      block(
        "padding:16px 0 0",
        `<p class="muted" style="margin:0;${FONT};font-size:16px;line-height:1.6;color:${light.muted}">${escapeHtml(paragraph)}</p>`,
      ),
    ),
    entries.length ? block("padding:28px 0 0", details(entries)) : "",
    button
      ? block(
          "padding:32px 0 0",
          table(
            "",
            `<tr><td class="button" style="background-color:${light.text};border-radius:8px"><a class="button-text" href="${escapeHtml(button.href)}" style="display:inline-block;padding:14px 26px;${FONT};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px">${escapeHtml(button.label)}</a></td></tr>`,
          ),
        )
      : "",
    footer.length
      ? block(
          "padding:36px 0 0",
          `<div class="line quiet" style="padding-top:20px;border-top:1px solid ${light.line};${FONT};font-size:13px;line-height:1.6;color:${light.quiet}">${footer
            .map((row) => `${escapeHtml(row.label)}: ${value(row, "quiet")}`)
            .join("<br>")}</div>`,
        )
      : "",
    design.signature?.length
      ? block(
          `padding:${footer.length ? 16 : 36}px 0 0`,
          `<div class="quiet" style="${FONT};font-size:13px;line-height:1.6;color:${light.quiet}">${design.signature
            .map((signed) => value({ value: signed.text, href: signed.href }, "quiet"))
            .join(" &middot; ")}</div>`,
        )
      : "",
  ];
  return `<!doctype html><html lang="${escapeHtml(language)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>${escapeHtml(heading)}</title><style>:root{color-scheme:light dark;supported-color-schemes:light dark}${DARK_RULES}</style></head><body style="margin:0;padding:0">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preview)}</div>
${table("width:100%", `<tr><td style="padding:32px 24px 40px">${table("width:100%;max-width:560px", parts.join("\n"), 560)}</td></tr>`)}
</body></html>`;
}
