import { expect, test } from "vitest";
import { inlineImage } from "@sharadox/email-web-library/inline-image";

test("decodes a base64 image into the bytes an email sends, under its id", () => {
  const image = inlineImage("logo", {
    filename: "logo.png",
    contentType: "image/png",
    content: Buffer.from("png").toString("base64"),
  });
  expect(image).toMatchObject({ id: "logo", filename: "logo.png", contentType: "image/png" });
  expect(Buffer.from(image.content).toString()).toBe("png");
});
