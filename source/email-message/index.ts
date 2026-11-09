import { checkEmailAddress } from "../email-address/index.ts";
import { EmailError } from "../email-error/index.ts";
import type { EmailMessage } from "./type.ts";

/** Longest subject accepted, in characters. */
export const SUBJECT_LIMIT = 300;
/** Most recipients accepted in one message. */
export const RECIPIENT_LIMIT = 50;

/**
 * Checks a message before it reaches the server: valid addresses, a one-line subject (no header injection), at
 * least one recipient and a body. Returns the message unchanged; throws `invalid-message` otherwise.
 */
export function checkEmailMessage(message: EmailMessage): EmailMessage {
  checkEmailAddress(message.from, "from");
  const recipients = Array.isArray(message.to) ? message.to : [message.to];
  if (recipients.length === 0 || recipients.length > RECIPIENT_LIMIT) {
    throw new EmailError("invalid-message", `to needs between 1 and ${RECIPIENT_LIMIT} recipients`);
  }
  recipients.forEach((recipient, index) => checkEmailAddress(recipient, `to[${index}]`));
  if (message.replyTo !== undefined) checkEmailAddress(message.replyTo, "replyTo");
  if (!message.subject.trim() || /[\r\n]/.test(message.subject) || message.subject.length > SUBJECT_LIMIT) {
    throw new EmailError("invalid-message", `subject must be one line of 1 to ${SUBJECT_LIMIT} characters`);
  }
  if (!message.text?.trim() && !message.html?.trim()) {
    throw new EmailError("invalid-message", "the message needs a text or html body");
  }
  return message;
}
