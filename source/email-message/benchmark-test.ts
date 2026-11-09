import { expect, test } from "vitest";
import { checkEmailMessage } from "./index.ts";

const message = {
  from: { name: "Website", address: "website@example.com" },
  to: Array.from({ length: 20 }, (_, index) => `person${index}@example.com`),
  subject: "New enquiry from the contact form",
  text: "Hello ".repeat(500),
};

test("checking a 20-recipient message takes well under a millisecond", async ({ bench }) => {
  const result = await bench("checkEmailMessage", () => checkEmailMessage(message)).run();
  expect(result.latency.mean).toBeLessThan(1);
});
