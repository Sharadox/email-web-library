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
export { checkEmailAddress } from "@sharadox/email-web-library/email-address";
export type { EmailAddress } from "@sharadox/email-web-library/email-address/type";
export { EmailError } from "@sharadox/email-web-library/email-error";
export type { EmailErrorCode } from "@sharadox/email-web-library/email-error/type";
export { checkEmailMessage, RECIPIENT_LIMIT, SUBJECT_LIMIT } from "@sharadox/email-web-library/email-message";
export type { EmailMessage, InlineImage } from "@sharadox/email-web-library/email-message/type";
export { createAmazonSesSender } from "@sharadox/email-web-library/amazon-ses-sender";
export type { AmazonCredentials, AmazonSesConfiguration } from "@sharadox/email-web-library/amazon-ses-sender/type";
export { createEmailSender } from "@sharadox/email-web-library/email-sender";
export type { EmailReceipt, EmailSender } from "@sharadox/email-web-library/email-sender/type";
export { readEmailServerConfiguration } from "@sharadox/email-web-library/email-server-configuration";
export type {
  EmailServerConfiguration,
  EmailServerSecurity,
  SmtpServerConfiguration,
} from "@sharadox/email-web-library/email-server-configuration/type";
export { EMAIL_COLORS, EMAIL_FONT, EMAIL_SPACES, emailLayout } from "@sharadox/email-web-library/email-layout";
export type { EmailContent, EmailDesign, EmailLogos, EmailRow } from "@sharadox/email-web-library/email-layout/type";
