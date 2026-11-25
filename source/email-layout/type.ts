/**
 * One detail: a label and its value, which is plain text (a link with `href`, its line breaks kept with
 * `keepLines`) or a list of items, one per line after a dot.
 */
export interface EmailRow {
  label: string;
  value: string | readonly string[];
  href?: string;
  /** Keeps the value's line breaks (a visitor's message). */
  keepLines?: boolean;
}

/**
 * What makes an email a company's. Every email shares one layout: no background (the mail app's own shows), black
 * and gray text that turns white and light gray in dark themes, Geist where the reader has it; a company only brings
 * its logo, its name and its site.
 */
export interface EmailDesign {
  /** The company: the logo's description, its name beside the logo with `wordmark`, and the sign-off's name. */
  name: string;
  /**
   * The size the logo is shown at, when the email carries it: the inline image "logo" (the real logo in black, with
   * a thin white outline that keeps it visible where a mail app darkens the email itself), and, for mail apps in
   * dark mode, "logo-dark" (the same in white).
   */
  logo?: { width: number; height: number };
  /** Whether the company's name is written beside the logo. */
  wordmark?: boolean;
  /** The company's lines at the very end of every email (its site). */
  signature?: readonly { text: string; href?: string }[];
}

/** Which logo images an email carries, as inline images "logo" and "logo-dark". */
export interface EmailLogos {
  light: boolean;
  dark: boolean;
}

/** A one-time code, shown one box per character. */
export interface EmailCode {
  /** Its label, for example "Code". */
  label: string;
  /** The code itself, for example "123456". */
  value: string;
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
  /** A one-time code under the paragraphs, one box per character. */
  code?: EmailCode;
  /** The details, each label over its value, lines between them. */
  rows?: readonly EmailRow[];
  /** The sign-off before the company's name: "Best regards,". */
  closing?: string;
}
