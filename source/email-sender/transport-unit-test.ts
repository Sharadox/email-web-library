import { afterEach, describe, expect, test, vi } from "vitest";

const sendMail = vi.fn();
const verify = vi.fn();
const createTransport = vi.fn<(options: Record<string, unknown>) => object>(() => ({ sendMail, verify }));
vi.mock("nodemailer", () => ({ createTransport }));
const { createEmailSender } = await import("@sharadox/email-web-library/email-sender");

const message = { from: "website@example.com", to: "inbox@example.com", subject: "Hello", text: "Hi" };
afterEach(() => vi.clearAllMocks());

describe("createEmailSender, with the transport replaced", () => {
  test("uses TLS on port 465 and STARTTLS elsewhere, with a ten-second timeout by default", () => {
    createEmailSender({ host: "smtp.example.com", port: 465, username: "u", password: "p" });
    expect(createTransport.mock.calls[0]![0]).toMatchObject({
      secure: true,
      requireTLS: false,
      connectionTimeout: 10_000,
    });
    createEmailSender({ host: "smtp.example.com", port: 587, username: "u", password: "p" });
    expect(createTransport.mock.calls[1]![0]).toMatchObject({ secure: false, requireTLS: true, socketTimeout: 20_000 });
  });

  test("reads recipients the server names as objects, and refuses a delivery nobody accepted", async () => {
    const sender = createEmailSender({ host: "smtp.example.com", port: 587, username: "u", password: "p" });
    sendMail.mockResolvedValueOnce({ messageId: "1", accepted: [{ address: "inbox@example.com" }], rejected: [] });
    expect(await sender.send(message)).toEqual({ messageId: "1", accepted: ["inbox@example.com"], rejected: [] });
    sendMail.mockResolvedValueOnce({ messageId: "2", accepted: [], rejected: ["inbox@example.com"] });
    await expect(sender.send(message)).rejects.toMatchObject({
      code: "delivery",
      message: "the server refused every recipient (inbox@example.com)",
    });
  });

  test("describes failures without their details, even when nothing explains them", async () => {
    const sender = createEmailSender({ host: "smtp.example.com", port: 587, username: "u", password: "p" });
    sendMail.mockRejectedValueOnce(undefined);
    await expect(sender.send(message)).rejects.toMatchObject({
      message: "sending through smtp.example.com failed: unknown error",
    });
    verify.mockRejectedValueOnce({ code: "EAUTH", responseCode: 535, message: "Invalid login\nsecond line" });
    await expect(sender.verify()).rejects.toMatchObject({
      message: "logging in to smtp.example.com failed: EAUTH 535 Invalid login",
    });
  });
});
