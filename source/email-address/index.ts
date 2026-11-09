import { EmailError } from "../email-error/index.ts";
import type { EmailAddress } from "./type.ts";

/** One address: a local part, an @, and a domain with at least one dot; no spaces, angle brackets or line breaks. */
const ADDRESS = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]+$/;
const LINE_BREAK = /[\r\n]/;

/** Checks an address (and its display name) and returns it unchanged; throws `invalid-message` otherwise. */
export function checkEmailAddress(value: EmailAddress, field: string): EmailAddress {
  const address = typeof value === "string" ? value : value.address;
  if (address.length > 254 || !ADDRESS.test(address)) {
    throw new EmailError("invalid-message", `${field} is not a valid email address`);
  }
  if (typeof value !== "string" && (LINE_BREAK.test(value.name) || value.name.length > 200)) {
    throw new EmailError("invalid-message", `${field} has an invalid display name`);
  }
  return value;
}
