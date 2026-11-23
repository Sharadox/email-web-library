import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import { createTransport } from "nodemailer";
import { EmailError } from "@sharadox/email-web-library/email-error";
import { checkEmailMessage } from "@sharadox/email-web-library/email-message";
import type { AmazonSesConfiguration } from "@sharadox/email-web-library/amazon-ses-sender/type";
import type { EmailSender } from "@sharadox/email-web-library/email-sender/type";

/** The first line of an error's message, without the message content. */
const reason = (error: unknown) => (error as Error | undefined)?.message?.split("\n")[0] || "unknown error";

/**
 * Creates a sender that sends through the Amazon SES API (version 2) with short-lived credentials, so no SMTP
 * password is kept. Nodemailer builds the message (MIME, inline images, non-English text), sent as one raw email.
 *
 * @example
 * import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";
 * const sender = createAmazonSesSender({
 *   kind: "amazon-ses",
 *   region: "eu-west-1",
 *   credentials: awsCredentialsProvider({ roleArn: "arn:aws:iam::123456789012:role/email-sending" }),
 * });
 * await sender.send({ from: { name: "Example", address: "contact@web.example.com" }, to: "contact@example.com", subject: "Hi", text: "Hello" });
 */
export function createAmazonSesSender(configuration: AmazonSesConfiguration): EmailSender {
  const timeout = configuration.timeout ?? 10_000;
  const where = `Amazon SES (${configuration.region})`;
  const sesClient = new SESv2Client({
    region: configuration.region,
    credentials: configuration.credentials,
    requestHandler: { connectionTimeout: timeout, requestTimeout: timeout * 2 },
  });
  const transport = createTransport({ SES: { sesClient, SendEmailCommand } });

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
          attachments: message.inlineImages?.map((image) => ({
            cid: image.id,
            filename: image.filename,
            contentType: image.contentType,
            content: Buffer.from(image.content),
            contentDisposition: "inline" as const,
          })),
          disableFileAccess: true,
          disableUrlAccess: true,
        });
        // Amazon SES takes every recipient or refuses the whole message.
        return { messageId: info.messageId, accepted: info.envelope.to, rejected: [] };
      } catch (error) {
        throw new EmailError("delivery", `sending through ${where} failed: ${reason(error)}`, { cause: error });
      }
    },
    async verify() {
      // Getting the credentials proves the identity and role; a test message would need a real sender address.
      try {
        await configuration.credentials();
      } catch (error) {
        throw new EmailError("delivery", `getting ${where} credentials failed: ${reason(error)}`, { cause: error });
      }
    },
  };
}
