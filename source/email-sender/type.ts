import type { EmailMessage } from "../email-message/type.ts";

/** What the server said when it took the message. */
export interface EmailReceipt {
  /** The Message-ID header, useful to find the message in logs. */
  messageId: string;
  /** Recipients the server accepted. */
  accepted: string[];
  /** Recipients the server refused (the message still went to the accepted ones). */
  rejected: string[];
}

/** Sends email through one SMTP server. */
export interface EmailSender {
  /** Checks the message, then sends it. Throws `EmailError` with code `invalid-message` or `delivery`. */
  send(message: EmailMessage): Promise<EmailReceipt>;
  /** Connects and logs in without sending, to check the configuration. Throws `EmailError` (`delivery`). */
  verify(): Promise<void>;
}
