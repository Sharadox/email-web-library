import { beforeEach, expect, test, vi } from "vitest";

/** Every command the fake Amazon SES client was given, and what the next one answers. */
const sent: { input: { Content: { Raw: { Data: Uint8Array } }; Destination: { ToAddresses: string[] } } }[] = [];
const clients: Record<string, unknown>[] = [];
let answer: () => Promise<unknown> = async () => ({ MessageId: "0100-abc" });
vi.mock("@aws-sdk/client-sesv2", () => ({
  SESv2Client: class {
    config: { region: () => Promise<string> };
    constructor(options: Record<string, unknown>) {
      clients.push(options);
      this.config = { region: async () => options.region as string };
    }
    send(command: (typeof sent)[number]) {
      sent.push(command);
      return answer();
    }
  },
  SendEmailCommand: class {
    input: unknown;
    constructor(input: unknown) {
      this.input = input;
    }
  },
}));
const { createAmazonSesSender } = await import("@sharadox/email-web-library/amazon-ses-sender");

beforeEach(() => {
  sent.length = 0;
  clients.length = 0;
  answer = async () => ({ MessageId: "0100-abc" });
});

const credentials = vi.fn(async () => ({ accessKeyId: "key", secretAccessKey: "secret", sessionToken: "session" }));
const sender = () => createAmazonSesSender({ kind: "amazon-ses", region: "eu-west-1", credentials, timeout: 5000 });
const message = {
  from: { name: "Sharadox", address: "contact@web.example.com" },
  to: ["visitor@example.org", "contact@example.com"],
  replyTo: "contact@example.com",
  subject: "Contacto · Ana (Café) · 019a",
  text: "Olá",
  html: "<p>Olá</p>",
};

test("sends the whole message as one raw email to every recipient, through the given region and credentials", async () => {
  const receipt = await sender().send(message);
  expect(receipt).toEqual({
    messageId: "<0100-abc@eu-west-1.amazonses.com>",
    accepted: ["visitor@example.org", "contact@example.com"],
    rejected: [],
  });
  expect(clients[0]).toMatchObject({ region: "eu-west-1", credentials });
  expect(sent[0]!.input.Destination.ToAddresses).toEqual(["visitor@example.org", "contact@example.com"]);
  const raw = Buffer.from(sent[0]!.input.Content.Raw.Data).toString();
  expect(raw).toContain("Reply-To: contact@example.com");
  expect(raw).toContain("Subject: =?UTF-8?");
});

test("carries inline images (the logo) inside the message, with the default timeout", async () => {
  const plain = createAmazonSesSender({ kind: "amazon-ses", region: "eu-west-1", credentials });
  const logo = { id: "logo", filename: "logo.png", contentType: "image/png", content: new Uint8Array([137, 80]) };
  await plain.send({ ...message, html: '<img src="cid:logo">', inlineImages: [logo] });
  expect(clients[0]).toMatchObject({ requestHandler: { connectionTimeout: 10_000, requestTimeout: 20_000 } });
  const raw = Buffer.from(sent[0]!.input.Content.Raw.Data).toString();
  expect(raw).toContain("Content-ID: <logo>");
  expect(raw).toContain("Content-Disposition: inline");
});

test("checks the message before sending it", async () => {
  await expect(sender().send({ ...message, to: [] })).rejects.toMatchObject({ code: "invalid-message" });
  expect(sent).toEqual([]);
});

test("says why Amazon SES refused it, as a delivery error", async () => {
  answer = async () => {
    throw Object.assign(new Error("Email address is not verified."), { name: "MessageRejected" });
  };
  await expect(sender().send(message)).rejects.toMatchObject({
    code: "delivery",
    message: "sending through Amazon SES (eu-west-1) failed: Email address is not verified.",
  });
  answer = () => Promise.reject(new Error(""));
  await expect(sender().send(message)).rejects.toMatchObject({
    message: "sending through Amazon SES (eu-west-1) failed: unknown error",
  });
});

test("verifies by getting the credentials, without sending anything", async () => {
  await expect(sender().verify()).resolves.toBeUndefined();
  expect(credentials).toHaveBeenCalled();
  expect(sent).toEqual([]);
  credentials.mockRejectedValueOnce(new Error("could not assume the role"));
  await expect(sender().verify()).rejects.toMatchObject({
    code: "delivery",
    message: "getting Amazon SES (eu-west-1) credentials failed: could not assume the role",
  });
});
