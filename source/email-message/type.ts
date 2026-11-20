import type { EmailAddress } from "@sharadox/email-web-library/email-address/type";

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
  /**
   * Images shown inside the html, such as the company's logo at the top: each is sent with the message and referred to
   * in the html as `cid:<id>` (`<img src="cid:logo">`), so it shows without loading anything from the internet.
   */
  inlineImages?: InlineImage[];
}

/** An image sent inside an email, referred to from its html as `cid:<id>`. */
export interface InlineImage {
  /** How the html refers to it: `<img src="cid:logo">` for the id "logo". */
  id: string;
  /** The image's file name, for example "logo.png". */
  filename: string;
  /** Its media type, for example "image/png". */
  contentType: string;
  /** The image's bytes. */
  content: Uint8Array;
}
