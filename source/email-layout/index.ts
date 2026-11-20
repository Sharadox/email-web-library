import { escapeHtml } from "@sharadox/web-library/html/escape";
import type { EmailContent, EmailDesign, EmailRow } from "@sharadox/email-web-library/email-layout/type";

/**
 * On phones, where the email app reads it (Apple Mail, the Gmail apps): narrower sides, and each detail's label over
 * its value, so values keep the whole width.
 */
const PHONE =
  "@media (max-width:520px){.side{padding-left:22px!important;padding-right:22px!important}.label,.value{display:block!important;width:auto!important}.label{padding:14px 0 2px!important}.value{border-top:0!important;padding:0 0 12px!important}}";

/** A table that's only there for layout, as email clients need. */
const table = (style: string, rows: string, width?: number) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0"${width ? ` width="${width}"` : ""} style="border-collapse:separate;${style}">${rows}</table>`;

/** The accent as a background: the gradient where the reader's device shows one, the plain color otherwise. */
const accentBackground = ({ colors }: EmailDesign) =>
  `background-color:${colors.accent};${colors.accentGradient ? `background-image:${colors.accentGradient};` : ""}`;

/** Text in the label style: small, spaced capitals. */
const labelStyle = (design: EmailDesign, color: string) =>
  `font-family:${design.fonts.label};font-size:${design.label.size}px;line-height:1.5;letter-spacing:${design.label.letterSpacing};text-transform:uppercase;color:${color}`;

/** A value, as a link when it has one. */
const value = ({ value: text, href }: { value: string; href?: string | undefined }, color: string) =>
  href
    ? `<a href="${escapeHtml(href)}" style="color:${color};text-decoration:underline;text-underline-offset:3px">${escapeHtml(text)}</a>`
    : escapeHtml(text);

/** The logo, and the company's name beside it with `wordmark`. */
function header(design: EmailDesign, logo: boolean) {
  const { colors, fonts } = design;
  const mark =
    logo && design.logo
      ? `<td style="vertical-align:middle;padding:0${design.wordmark ? " 12px 0 0" : ""}"><img src="cid:logo" width="${design.logo.width}" height="${design.logo.height}" alt="${escapeHtml(design.name)}" style="display:block;width:${design.logo.width}px;height:${design.logo.height}px;border:0"></td>`
      : "";
  const name =
    design.wordmark || !mark
      ? `<td style="vertical-align:middle;font-family:${fonts.body};font-size:19px;font-weight:600;letter-spacing:-0.02em;color:${colors.text}">${escapeHtml(design.name)}</td>`
      : "";
  return table(design.align === "center" ? "margin:0 auto" : "", `<tr>${mark}${name}</tr>`);
}

/** The details, one per line: the label above or beside its value, rules between them. */
function details(design: EmailDesign, rows: readonly EmailRow[]) {
  const { colors, fonts } = design;
  const line = `border-top:1px ${design.rule} ${colors.rule}`;
  return table(
    "width:100%;margin:28px 0 0",
    rows
      .map(
        (row) =>
          `<tr><td class="label" style="${line};padding:14px 16px 14px 0;width:136px;vertical-align:top;${labelStyle(design, colors.quiet)}">${escapeHtml(row.label)}</td><td class="value" style="${line};padding:12px 0;vertical-align:top;font-family:${fonts.body};font-size:15px;line-height:1.55;color:${colors.text};word-break:break-word">${value(row, colors.text)}</td></tr>`,
      )
      .join("") + `<tr><td colspan="2" style="${line};font-size:0;line-height:0">&nbsp;</td></tr>`,
  );
}

/** A longer text in its own box, keeping its line breaks. */
function quoted(design: EmailDesign, quote: { label: string; text: string }) {
  const { colors, fonts } = design;
  const bar = design.quoteBar ? `border-left:2px solid ${colors.accent};` : "";
  return `<p style="margin:32px 0 10px;${labelStyle(design, colors.quiet)}">${escapeHtml(quote.label)}</p>${table(
    "width:100%",
    `<tr><td style="${bar}padding:20px 22px;background-color:${colors.box};border:1px solid ${colors.edge};border-radius:${Math.min(design.radius, 14)}px;font-family:${fonts.body};font-size:15px;line-height:1.7;color:${colors.text};white-space:pre-wrap;word-break:break-word">${escapeHtml(quote.text)}</td></tr>`,
  )}`;
}

/** The one thing to do next, as a button that works in every email client (a padded link). */
function action(design: EmailDesign, button: { label: string; href: string }) {
  const { colors, fonts } = design;
  return table(
    `margin:32px ${design.align === "center" ? "auto" : "0"} 0`,
    `<tr><td style="${accentBackground(design)}border-radius:${design.button.radius}px"><a href="${escapeHtml(button.href)}" style="display:inline-block;padding:14px 28px;font-family:${fonts.body};font-size:14px;font-weight:600;letter-spacing:${design.button.letterSpacing};${design.button.uppercase ? "text-transform:uppercase;" : ""}color:${colors.onAccent};text-decoration:none;border-radius:${design.button.radius}px">${escapeHtml(button.label)}</a></td></tr>`,
  );
}

/** A "+" where two of the frame's lines cross, centered on them (it spans two half cells each way). */
const cross = ({ fonts, colors }: EmailDesign) =>
  `<td colspan="2" rowspan="2" width="12" height="12" align="center" valign="middle" style="width:12px;height:12px;padding:0;font-family:${fonts.label};font-size:19px;line-height:12px;color:${colors.quiet}">+</td>`;

/**
 * The card inside a grid's frame, drawn from table cells so it holds in every email client: lines along its four
 * sides, each through the middle of a pair of half cells, and a "+" where they cross at each corner.
 */
function framed(design: EmailDesign, card: string) {
  const line = `1px solid ${design.colors.edge}`;
  const half = (style = "") =>
    `<td width="6" style="width:6px;padding:0;font-size:0;line-height:0;${style}">&nbsp;</td>`;
  const across = (style: string) => `<td style="height:6px;padding:0;font-size:0;line-height:0;${style}">&nbsp;</td>`;
  return table(
    "width:100%;max-width:612px",
    `<tr>${cross(design)}${across(`border-bottom:${line}`)}${cross(design)}</tr><tr>${across("")}</tr>
<tr>${half(`border-right:${line}`)}${half()}<td style="padding:0;background-color:${design.colors.card}">${card}</td>${half(`border-right:${line}`)}${half()}</tr>
<tr>${cross(design)}${across(`border-bottom:${line}`)}${cross(design)}</tr><tr>${across("")}</tr>`,
    612,
  );
}

/**
 * An email in a brand's design, the same in every inbox: its logo (and name), a rule in its color, an eyebrow and a
 * heading, then paragraphs, details, a quoted text and one button, small print, and the company's signature. Built
 * from tables with inline styles, as email clients need; everything given is escaped. `logo` says whether the email
 * carries the inline image "logo".
 *
 * @example
 * emailLayout({ language: "en", preview: "Ana sent a message", eyebrow: "Contact", heading: "Ana",
 *   rows: [{ label: "Email", value: "ana@example.com" }] }, SHARADOX_EMAIL, true);
 */
export function emailLayout(content: EmailContent, design: EmailDesign, logo: boolean): string {
  const { colors, fonts } = design;
  const { language, preview, eyebrow, heading, paragraphs = [], rows = [], quote, button, footer = [] } = content;
  const centered = design.align === "center";
  const eyebrowLine = design.eyebrowLine
    ? `<span style="display:inline-block;width:28px;height:1px;${accentBackground(design)}vertical-align:middle;margin:0 12px 2px 0"></span>`
    : "";
  const small = footer.length
    ? `<tr><td class="side" style="padding:22px 36px;border-top:1px ${design.rule} ${colors.rule};${labelStyle(design, colors.quiet)};text-transform:none;letter-spacing:0">${footer
        .map((row) => `${escapeHtml(row.label)}: ${value(row, colors.muted)}`)
        .join("<br>")}</td></tr>`
    : "";
  const signature = design.signature?.length
    ? `<tr><td align="center" style="padding:24px 12px 0;${labelStyle(design, colors.quiet)}">${design.signature
        .map(
          (line) =>
            `<span style="white-space:nowrap">${value({ value: line.text, href: line.href }, colors.quiet)}</span>`,
        )
        .join(`<span style="padding:0 10px">&middot;</span>`)}</td></tr>`
    : "";
  const card = `<tr><td class="side" style="padding:32px 36px 0;text-align:${design.align}">${header(design, logo)}</td></tr>
<tr><td class="side" style="padding:24px 36px 0"><div style="height:1px;line-height:1px;font-size:0;${colors.headerRule ? `background:${colors.headerRule};` : accentBackground(design)}">&nbsp;</div></td></tr>
<tr><td class="side" style="padding:32px 36px 36px">
<p style="margin:0 0 14px;text-align:${design.align};${labelStyle(design, colors.accent)}">${eyebrowLine}${escapeHtml(eyebrow)}</p>
<h1 style="margin:0;text-align:${design.align};font-family:${fonts.heading};font-size:${design.heading.size}px;font-weight:${design.heading.weight};line-height:${design.heading.lineHeight};letter-spacing:${design.heading.letterSpacing};color:${colors.text}">${escapeHtml(heading)}</h1>
${paragraphs.map((paragraph) => `<p style="margin:18px 0 0;text-align:${centered ? "center" : "left"};font-family:${fonts.body};font-size:15px;line-height:1.7;color:${colors.muted}">${escapeHtml(paragraph)}</p>`).join("")}${rows.length ? details(design, rows) : ""}${quote ? quoted(design, quote) : ""}${button ? action(design, button) : ""}
</td></tr>${small}`;
  return `<!doctype html><html lang="${escapeHtml(language)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>${escapeHtml(heading)}</title><style>${PHONE}</style></head><body style="margin:0;padding:0;background-color:${colors.page}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preview)}</div>
${table(
  `width:100%;background-color:${colors.page}`,
  `<tr><td align="center" style="padding:28px 8px 40px">${
    design.crosses
      ? framed(design, table("width:100%", card))
      : table(
          `width:100%;max-width:600px;background-color:${colors.card};border:1px solid ${colors.edge};border-radius:${design.radius}px`,
          card,
          600,
        )
  }${signature ? table("width:100%;max-width:600px", signature) : ""}</td></tr>`,
)}
</body></html>`;
}
