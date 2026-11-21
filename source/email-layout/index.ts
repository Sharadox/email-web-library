import { escapeHtml } from "@sharadox/web-library/html/escape";
import type { EmailContent, EmailDesign } from "@sharadox/email-web-library/email-layout/type";

/** The one palette every email is drawn in: black on white, which every mail app darkens well on its own. */
export const EMAIL_COLORS = {
  background: "#ffffff",
  text: "#000000",
  /** Paragraphs. */
  muted: "#3f3f46",
  /** Labels and small print. */
  quiet: "#71717a",
  /** Lines between details. */
  line: "#e4e4e7",
} as const;

/** The device's own sans: what every font stack falls back to. */
export const SYSTEM_FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** A table that's only there for layout, as email clients need. */
const table = (style: string, rows: string, width?: number) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0"${width ? ` width="${width}"` : ""} style="border-collapse:collapse;${style}">${rows}</table>`;

/** Small spaced capitals: eyebrows and labels. */
const capitals = (font: string, color: string) =>
  `font-family:${font};font-size:12px;font-weight:600;line-height:1.5;letter-spacing:0.08em;text-transform:uppercase;color:${color}`;

/** A value, as a link when it has one. */
const value = ({ value: text, href }: { value: string; href?: string | undefined }, color: string) =>
  href
    ? `<a href="${escapeHtml(href)}" style="color:${color};text-decoration:underline">${escapeHtml(text)}</a>`
    : escapeHtml(text);

/** The logo at the top left, and the company's name beside it with `wordmark` (or alone, without a logo). */
function header(design: EmailDesign, logo: boolean, font: string) {
  const mark =
    logo && design.logo
      ? `<td style="vertical-align:middle;padding:0${design.wordmark ? " 10px 0 0" : ""}"><img src="cid:logo" width="${design.logo.width}" height="${design.logo.height}" alt="${escapeHtml(design.name)}" style="display:block;width:${design.logo.width}px;height:${design.logo.height}px;border:0"></td>`
      : "";
  const name =
    design.wordmark || !mark
      ? `<td style="vertical-align:middle;font-family:${font};font-size:19px;font-weight:700;letter-spacing:-0.01em;color:${design.color}">${escapeHtml(design.name)}</td>`
      : "";
  return table("", `<tr>${mark}${name}</tr>`);
}

/**
 * An email in a brand's design, the same in every inbox: the logo at the top left, an eyebrow and a heading in the
 * brand's color, then paragraphs, details (each label over its value), a quoted text under a label in the brand's color, one button, small print,
 * and the company's signature. Black on white with every style inline, no dark-mode rules and no backgrounds but the
 * button's: what mail apps change, they change the same way everywhere. `logo` says whether the email carries the
 * inline image "logo"; everything given is escaped.
 *
 * @example
 * emailLayout({ language: "en", preview: "Ana sent a message", eyebrow: "Contact", heading: "Ana",
 *   rows: [{ label: "Email", value: "ana@example.com" }] }, { name: "Acme", color: "#000000" }, false);
 */
export function emailLayout(content: EmailContent, design: EmailDesign, logo: boolean): string {
  const { language, preview, eyebrow, heading, paragraphs = [], rows = [], quote, button, footer = [] } = content;
  const { background, text, muted, quiet, line } = EMAIL_COLORS;
  const body = design.fonts?.body ?? SYSTEM_FONT;
  const headings = design.fonts?.heading ?? body;
  const block = (style: string, inside: string) => `<tr><td style="${style}">${inside}</td></tr>`;
  const parts = [
    block("padding:0 0 36px", header(design, logo, headings)),
    block("padding:0 0 10px", `<div style="${capitals(body, design.color)}">${escapeHtml(eyebrow)}</div>`),
    block(
      "padding:0",
      `<h1 style="margin:0;font-family:${headings};font-size:30px;font-weight:700;line-height:1.2;letter-spacing:-0.01em;color:${design.color}">${escapeHtml(heading)}</h1>`,
    ),
    ...paragraphs.map((paragraph) =>
      block(
        "padding:16px 0 0",
        `<p style="margin:0;font-family:${body};font-size:16px;line-height:1.6;color:${muted}">${escapeHtml(paragraph)}</p>`,
      ),
    ),
    rows.length
      ? block(
          "padding:28px 0 0",
          table(
            "width:100%",
            rows
              .map(
                (row) =>
                  `<tr><td style="padding:14px 0;border-top:1px solid ${line};font-family:${body};word-break:break-word"><div style="${capitals(body, quiet)}">${escapeHtml(row.label)}</div><div style="padding-top:4px;font-size:16px;line-height:1.5;color:${text}">${value(row, text)}</div></td></tr>`,
              )
              .join("") + `<tr><td style="border-top:1px solid ${line};font-size:0;line-height:0">&nbsp;</td></tr>`,
          ),
        )
      : "",
    quote
      ? block(
          "padding:28px 0 0",
          `<div style="${capitals(body, design.color)}">${escapeHtml(quote.label)}</div>${table(
            "width:100%;margin-top:10px",
            `<tr><td style="padding:2px 0 2px 16px;border-left:3px solid ${design.color};font-family:${body};font-size:16px;line-height:1.6;color:${text};white-space:pre-wrap;word-break:break-word">${escapeHtml(quote.text)}</td></tr>`,
          )}`,
        )
      : "",
    button
      ? block(
          "padding:32px 0 0",
          table(
            "",
            `<tr><td style="background-color:${design.color};border-radius:8px"><a href="${escapeHtml(button.href)}" style="display:inline-block;padding:14px 26px;font-family:${body};font-size:15px;font-weight:600;color:${design.onColor ?? "#ffffff"};text-decoration:none;border-radius:8px">${escapeHtml(button.label)}</a></td></tr>`,
          ),
        )
      : "",
    footer.length
      ? block(
          "padding:36px 0 0",
          `<div style="padding-top:20px;border-top:1px solid ${line};font-family:${body};font-size:13px;line-height:1.6;color:${quiet}">${footer
            .map((row) => `${escapeHtml(row.label)}: ${value(row, quiet)}`)
            .join("<br>")}</div>`,
        )
      : "",
    design.signature?.length
      ? block(
          `padding:${footer.length ? 16 : 36}px 0 0;font-family:${body};font-size:13px;line-height:1.6;color:${quiet}`,
          design.signature.map((signed) => value({ value: signed.text, href: signed.href }, quiet)).join(" &middot; "),
        )
      : "",
  ];
  return `<!doctype html><html lang="${escapeHtml(language)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(heading)}</title></head><body style="margin:0;padding:0;background-color:${background}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preview)}</div>
${table(
  `width:100%;background-color:${background}`,
  `<tr><td style="padding:32px 24px 40px">${table("width:100%;max-width:560px", parts.join("\n"), 560)}</td></tr>`,
)}
</body></html>`;
}
