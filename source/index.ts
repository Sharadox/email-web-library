/**
 * Send email from web applications through any SMTP server.
 *
 * ```ts
 * import { createEmailSender, readEmailServerConfiguration } from "@sharadox/email-web-library";
 *
 * const sender = createEmailSender(readEmailServerConfiguration());
 * await sender.send({ from: "website@example.com", to: "inbox@example.com", subject: "Hello", text: "Hi!" });
 * ```
 *
 * @packageDocumentation
 */
export { checkEmailAddress } from "./email-address/index.ts";
export type { EmailAddress } from "./email-address/type.ts";
export { EmailError } from "./email-error/index.ts";
export type { EmailErrorCode } from "./email-error/type.ts";
export { checkEmailMessage, RECIPIENT_LIMIT, SUBJECT_LIMIT } from "./email-message/index.ts";
export type { EmailMessage } from "./email-message/type.ts";
export { createEmailSender } from "./email-sender/index.ts";
export type { EmailReceipt, EmailSender } from "./email-sender/type.ts";
export { readEmailServerConfiguration } from "./email-server-configuration/index.ts";
export type { EmailServerConfiguration, EmailServerSecurity } from "./email-server-configuration/type.ts";
