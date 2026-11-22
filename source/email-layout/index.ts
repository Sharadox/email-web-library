import { escapeHtml } from "@sharadox/web-library/html/escape";
import type { EmailContent, EmailDesign, EmailLogos, EmailRow } from "@sharadox/email-web-library/email-layout/type";

/**
 * The colors every email is drawn in, with no background (the mail app's own shows): `strong` for the logo, the
 * heading, the values, the company's name and its site; `soft` for labels and the rest of the text; `line` between
 * details. Each in a light theme and a dark one.
 */
export const EMAIL_COLORS = {
  light: { strong: "#000000", soft: "#5E5E5E", line: "#5E5E5E" },
  dark: { strong: "#FFFFFF", soft: "#A1A1A1", line: "#5E5E5E" },
} as const;

/** Geist where the reader has it, the device's own sans otherwise. */
export const EMAIL_FONT = "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** The only spaces between things, in pixels: 4, 8, 16 (the usual one) and 32. */
export const EMAIL_SPACES = { tiny: 4, small: 8, normal: 16, large: 32 } as const;

const { light, dark } = EMAIL_COLORS;
const { tiny, small, normal, large } = EMAIL_SPACES;

/** The dark theme's rules, one class per role. */
const DARK = `.strong{color:${dark.strong}!important}.soft{color:${dark.soft}!important}.line{border-color:${dark.line}!important}.logo-light{display:none!important}.logo-dark{display:block!important;max-height:none!important;overflow:visible!important}`;

/**
 * The dark theme, for mail apps that honor it (Apple Mail, Outlook on phones and Macs, and others): white and light
 * gray text, dark lines, and the white logo instead of the black one. Said again for Outlook.com, which marks its dark
 * theme with a `data-ogsc` attribute. Mail apps that ignore it darken the email their own way, which the black
 * logo's white outline survives.
 */
const DARK_RULES = `@media (prefers-color-scheme:dark){${DARK}}${DARK.replace(/(^|\})\./g, "$1[data-ogsc] .")}`;

/** The font, on everything. */
const FONT = `font-family:${EMAIL_FONT}`;

/** A table that's only there for layout, as email clients need. */
const table = (style: string, rows: string, attributes = "") =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0"${attributes} style="border-collapse:collapse;${style}">${rows}</table>`;

/** Text in one of the two colors. */
const colored = (role: "strong" | "soft", style: string) =>
  `class="${role}" style="${FONT};${style};color:${light[role]}"`;

/** Small spaced capitals: the eyebrow and the labels. */
const CAPITALS = colored(
  "soft",
  "font-size:12px;font-weight:600;line-height:16px;letter-spacing:0.08em;text-transform:uppercase",
);

/** A detail's value: text, a link, or a list of items, one per line after a dot. */
function value(row: EmailRow) {
  if (typeof row.value !== "string") return row.value.map((item) => `&bull;&nbsp;${escapeHtml(item)}`).join("<br>");
  const text = escapeHtml(row.value);
  return row.href
    ? `<a class="strong" href="${escapeHtml(row.href)}" style="color:${light.strong};text-decoration:underline">${text}</a>`
    : text;
}

/** The logo: the black one, and the white one for dark themes, hidden unless a dark theme shows it. */
function mark(design: EmailDesign, logos: EmailLogos) {
  if (!logos.light || !design.logo) return "";
  const { width, height } = design.logo;
  const image = (id: string) =>
    `<img src="cid:${id}" width="${width}" height="${height}" alt="${escapeHtml(design.name)}" style="display:block;width:${width}px;height:${height}px;border:0">`;
  const darkLogo = logos.dark
    ? `<div class="logo-dark" style="display:none;max-height:0;overflow:hidden;mso-hide:all">${image("logo-dark")}</div>`
    : "";
  return `<td style="vertical-align:middle;padding:0${design.wordmark ? ` ${small}px 0 0` : ""}"><div class="logo-light">${image("logo")}</div>${darkLogo}</td>`;
}

/** The logo at the top, and the company's name beside it with `wordmark` (or alone, without a logo). */
function header(design: EmailDesign, logos: EmailLogos) {
  const logo = mark(design, logos);
  const name =
    design.wordmark || !logo
      ? `<td ${colored("strong", "vertical-align:middle;font-size:19px;font-weight:700;letter-spacing:-0.01em")}>${escapeHtml(design.name)}</td>`
      : "";
  return table("", `<tr>${logo}${name}</tr>`);
}

/** The details, each label over its value, a line between each and the next. */
function details(rows: readonly EmailRow[]) {
  return table(
    "width:100%",
    rows
      .map(
        (row, index) =>
          `<tr><td class="line" style="padding:${normal}px 0;${index ? `border-top:1px solid ${light.line};` : ""}word-break:break-word"><div ${CAPITALS}>${escapeHtml(row.label)}</div><div ${colored("strong", `padding-top:${tiny}px;font-size:16px;line-height:24px${row.keepLines ? ";white-space:pre-wrap" : ""}`)}>${value(row)}</div></td></tr>`,
      )
      .join(""),
  );
}

/**
 * An email that looks the same in every inbox, in a centered column 600 pixels wide: the logo, an eyebrow and a
 * heading, paragraphs, the details (each label over its value, lines between them), a sign-off with the company's
 * name, and its site. No background: the mail app's own shows; the text is black and gray, white and light gray in
 * dark themes where the mail app honors them (the only styles not inline). Spaces are 4, 8, 16 or 32 pixels. Geist
 * where the reader has it, the device's own sans otherwise. Everything given is escaped. `logos` says which logo
 * images the email carries (`true`: the black one only).
 *
 * @example
 * emailLayout({ language: "en", preview: "Ana sent a message", eyebrow: "Contact", heading: "Thank you, Ana.",
 *   rows: [{ label: "Email", value: "ana@example.com" }], closing: "Best regards," }, { name: "Acme" }, false);
 */
export function emailLayout(content: EmailContent, design: EmailDesign, logos: EmailLogos | boolean): string {
  const carried = typeof logos === "boolean" ? { light: logos, dark: false } : logos;
  const { language, preview, eyebrow, heading, paragraphs = [], rows = [], closing } = content;
  const block = (top: number, inside: string) => `<tr><td style="padding:${top}px 0 0">${inside}</td></tr>`;
  const parts = [
    `<tr><td style="padding:0">${header(design, carried)}</td></tr>`,
    block(large, `<div ${CAPITALS}>${escapeHtml(eyebrow)}</div>`),
    block(
      small,
      `<h1 ${colored("strong", "margin:0;font-size:28px;font-weight:700;line-height:32px;letter-spacing:-0.01em")}>${escapeHtml(heading)}</h1>`,
    ),
    ...paragraphs.map((paragraph, index) =>
      block(
        index ? small : normal,
        `<p ${colored("soft", "margin:0;font-size:16px;line-height:24px")}>${escapeHtml(paragraph)}</p>`,
      ),
    ),
    rows.length ? block(large - normal, details(rows)) : "",
    closing
      ? block(
          rows.length ? large - normal : large,
          `<p ${colored("soft", "margin:0;font-size:16px;line-height:24px")}>${escapeHtml(closing)}<br><b class="strong" style="color:${light.strong}">${escapeHtml(design.name)}</b>.</p>`,
        )
      : "",
    design.signature?.length
      ? block(
          large,
          `<div ${colored("strong", "font-size:14px;line-height:20px")}>${design.signature
            .map((signed) =>
              signed.href
                ? `<a class="strong" href="${escapeHtml(signed.href)}" style="color:${light.strong};text-decoration:underline">${escapeHtml(signed.text)}</a>`
                : escapeHtml(signed.text),
            )
            .join(" &middot; ")}</div>`,
        )
      : "",
  ];
  return `<!doctype html><html lang="${escapeHtml(language)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>${escapeHtml(heading)}</title><style>:root{color-scheme:light dark;supported-color-schemes:light dark}${DARK_RULES}</style></head><body style="margin:0;padding:0">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preview)}</div>
${table("width:100%", `<tr><td align="center" style="padding:0">${table(`width:100%;max-width:600px;margin:0 auto`, `<tr><td style="padding:${normal}px">${table("width:100%", parts.join("\n"))}</td></tr>`, ' width="600" align="center"')}</td></tr>`)}
</body></html>`;
}
