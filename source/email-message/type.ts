import type { EmailAddress } from "../email-address/type.ts";

/** An email to send. Give `text`, `html` or both (text is the fallback for clients that don't show html). */
export interface EmailMessage {
  /** Sender. Most servers only accept the address you log in with (or an alias of it). */
  from: EmailAddress;
  /** One or more recipients. */
  to: EmailAddress | EmailAddress[];
  /** Where replies go, for example the visitor who filled a contact form. */
  replyTo?: EmailAddress;
  subject: string;
  text?: string;
  html?: string;
}
