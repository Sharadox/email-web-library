/** One line of a details table or of the small print: a label and its value (plain text, or a link with `href`). */
export interface EmailRow {
  label: string;
  value: string;
  href?: string;
}

/**
 * What makes an email a company's. Every email shares one layout: no background (the mail app's own shows), text,
 * logo and button in the foreground color of the reader's theme (black, or white in dark mode), Geist where the
 * reader has it; a company only brings its logo and name.
 */
export interface EmailDesign {
  /** The company: the logo's description, and its name beside the logo with `wordmark`. */
  name: string;
  /**
   * The size the logo is shown at, when the email carries it: the inline image "logo" (the real logo in black, with
   * a thin white outline that keeps it visible where a mail app darkens the email itself), and, for mail apps in
   * dark mode, "logo-dark" (the same in white).
   */
  logo?: { width: number; height: number };
  /** Whether the company's name is written beside the logo. */
  wordmark?: boolean;
  /** The company's lines at the very bottom of every email (its site). */
  signature?: readonly { text: string; href?: string }[];
}

/** Which logo images an email carries, as inline images "logo" and "logo-dark". */
export interface EmailLogos {
  light: boolean;
  dark: boolean;
}

/** What one email says. */
export interface EmailContent {
  /** The language of the email, for the html's `lang`. */
  language: string;
  /** The line shown in the inbox's preview, before the email is opened. */
  preview: string;
  /** The small capitals above the heading, for example "Contact". */
  eyebrow: string;
  heading: string;
  /** Paragraphs under the heading. */
  paragraphs?: readonly string[];
  /** The details, each label over its value. */
  rows?: readonly EmailRow[];
  /** A longer text keeping its line breaks (a visitor's message), shown as the last detail, with its label. */
  quote?: { label: string; text: string };
  /** The one thing to do next, as a button: reply, call, visit. */
  button?: { label: string; href: string };
  /** Small print: where it came from, when, and so on. */
  footer?: readonly EmailRow[];
}
