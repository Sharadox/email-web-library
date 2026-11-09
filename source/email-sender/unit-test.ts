import { SMTPServer } from "smtp-server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createEmailSender } from "./index.ts";

interface Received {
  from: string;
  to: string[];
  data: string;
}

/** A local SMTP server that accepts one login and records every message. */
const received: Received[] = [];
const server = new SMTPServer({
  authOptional: false,
  disabledCommands: ["STARTTLS"],
  allowInsecureAuth: true,
  onAuth(authentication, _session, callback) {
    if (authentication.username === "website@example.com" && authentication.password === "secret") {
      callback(null, { user: authentication.username });
    } else callback(new Error("Invalid login"));
  },
  onRcptTo(address, _session, callback) {
    if (address.address.endsWith("@refused.example")) callback(new Error("No such user"));
    else callback();
  },
  onData(stream, session, callback) {
    let data = "";
    stream.on("data", (chunk: Buffer) => (data += chunk.toString()));
    stream.on("end", () => {
      received.push({
        from: session.envelope.mailFrom ? session.envelope.mailFrom.address : "",
        to: session.envelope.rcptTo.map((recipient) => recipient.address),
        data,
      });
      callback();
    });
  },
});
let port = 0;

beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  port = (server.server.address() as { port: number }).port;
});
afterAll(() => new Promise<void>((resolve) => server.close(resolve)));

const sender = (password = "secret") =>
  createEmailSender({ host: "127.0.0.1", port, username: "website@example.com", password, security: "none" });

const message = {
  from: { name: "Sharadox Website", address: "website@example.com" },
  to: "inbox@example.com",
  replyTo: { name: "Ana Sá", address: "ana@example.pt" },
  subject: "Novo pedido — Café Zé",
  text: "Olá!\n.\nA line with only a dot must survive.",
};

describe("createEmailSender", () => {
  it("logs in and delivers the message with its headers and non-English text intact", async () => {
    const receipt = await sender().send(message);
    expect(receipt.accepted).toEqual(["inbox@example.com"]);
    expect(receipt.messageId).toMatch(/^<.+>$/);
    const last = received.at(-1)!;
    expect(last.from).toBe("website@example.com");
    expect(last.to).toEqual(["inbox@example.com"]);
    expect(last.data).toMatch(/^Reply-To: =\?UTF-8\?Q\?Ana_S=C3=A1\?= <ana@example\.pt>/m);
    expect(last.data).toMatch(/^Subject: =\?UTF-8\?/m);
    expect(last.data).toContain("A line with only a dot must survive.");
  });

  it("verifies the login without sending", async () => {
    const before = received.length;
    await expect(sender().verify()).resolves.toBeUndefined();
    expect(received.length).toBe(before);
  });

  it("reports a wrong password as a delivery error", async () => {
    await expect(sender("wrong").send(message)).rejects.toMatchObject({ code: "delivery" });
  });

  it("delivers to accepted recipients and reports the refused ones", async () => {
    const receipt = await sender().send({ ...message, to: ["inbox@example.com", "ghost@refused.example"] });
    expect(receipt).toMatchObject({ accepted: ["inbox@example.com"], rejected: ["ghost@refused.example"] });
  });

  it("fails when every recipient is refused", async () => {
    await expect(sender().send({ ...message, to: "ghost@refused.example" })).rejects.toMatchObject({
      code: "delivery",
    });
  });

  it("never contacts the server for an invalid message", async () => {
    const before = received.length;
    await expect(sender().send({ ...message, subject: "Hi\nBcc: victim@example.com" })).rejects.toMatchObject({
      code: "invalid-message",
    });
    expect(received.length).toBe(before);
  });

  it("reports an unreachable server as a delivery error", async () => {
    const unreachable = createEmailSender({
      host: "127.0.0.1",
      port: 1,
      username: "a",
      password: "b",
      security: "none",
      timeout: 2000,
    });
    await expect(unreachable.send(message)).rejects.toMatchObject({ code: "delivery" });
  });
});
