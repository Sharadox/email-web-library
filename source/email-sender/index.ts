import { createTransport } from "nodemailer";
import { EmailError } from "../email-error/index.ts";
import { checkEmailMessage } from "../email-message/index.ts";
import type { EmailServerConfiguration } from "../email-server-configuration/type.ts";
import type { EmailReceipt, EmailSender } from "./type.ts";

const addressText = (entry: string | { address: string }) => (typeof entry === "string" ? entry : entry.address);

/**
 * Creates a sender for one SMTP server. Each `send` opens its own short connection, which suits serverless
 * functions (nothing to close, nothing kept between invocations).
 *
 * The SMTP protocol work (STARTTLS, login, MIME, encoding of non-English text) is done by Nodemailer; this library
 * adds the configuration, the message checks and one error type.
 */
export function createEmailSender(configuration: EmailServerConfiguration): EmailSender {
  const security = configuration.security ?? (configuration.port === 465 ? "tls" : "starttls");
  const timeout = configuration.timeout ?? 10_000;
  const transport = createTransport({
    host: configuration.host,
    port: configuration.port,
    secure: security === "tls",
    requireTLS: security === "starttls",
    ignoreTLS: security === "none",
    auth: { user: configuration.username, pass: configuration.password },
    connectionTimeout: timeout,
    greetingTimeout: timeout,
    socketTimeout: timeout * 2,
  });

  return {
    async send(message) {
      checkEmailMessage(message);
      try {
        const info = await transport.sendMail({
          from: message.from,
          to: message.to,
          replyTo: message.replyTo,
          subject: message.subject,
          text: message.text,
          html: message.html,
          disableFileAccess: true,
          disableUrlAccess: true,
        });
        const receipt: EmailReceipt = {
          messageId: info.messageId,
          accepted: info.accepted.map(addressText),
          rejected: info.rejected.map(addressText),
        };
        if (receipt.accepted.length === 0) {
          throw new EmailError("delivery", `the server refused every recipient (${receipt.rejected.join(", ")})`);
        }
        return receipt;
      } catch (error) {
        if (error instanceof EmailError) throw error;
        throw new EmailError("delivery", `sending through ${configuration.host} failed: ${describe(error)}`, {
          cause: error,
        });
      }
    },
    async verify() {
      try {
        await transport.verify();
      } catch (error) {
        throw new EmailError("delivery", `logging in to ${configuration.host} failed: ${describe(error)}`, {
          cause: error,
        });
      }
    },
  };
}

/** A short reason without the password or message content. */
function describe(error: unknown): string {
  const { code, responseCode, message } = (error ?? {}) as { code?: string; responseCode?: number; message?: string };
  return [code, responseCode, message?.split("\n")[0]].filter(Boolean).join(" ") || "unknown error";
}
