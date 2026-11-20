import type { InlineImage } from "@sharadox/email-web-library/email-message/type";

/**
 * An image to send inside an email from one kept as base64 text (as a library ships its logo): its bytes decoded,
 * with the id its html refers to (`cid:<id>`).
 *
 * @example
 * inlineImage("logo", { filename: "logo.png", contentType: "image/png", content: "iVBORw0KGgo…" });
 */
export function inlineImage(
  id: string,
  image: { filename: string; contentType: string; content: string },
): InlineImage {
  return {
    id,
    filename: image.filename,
    contentType: image.contentType,
    content: Buffer.from(image.content, "base64"),
  };
}
