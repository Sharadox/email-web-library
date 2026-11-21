/** One line of a details table or of the small print: a label and its value (plain text, or a link with `href`). */
export interface EmailRow {
  label: string;
  value: string;
  href?: string;
}

/**
 * What makes an email a brand's. Every email shares one simple layout, black on white, that every mail app shows the
 * same way and darkens on its own in dark mode; a brand only brings its logo, its color and its type. Fonts are font
 * stacks the reader's device already has (no web fonts, which would tell a font service the email was opened).
 */
export interface EmailDesign {
  /** The company: the logo's description, and its name beside the logo with `wordmark`. */
  name: string;
  /** The size the inline image "logo" is shown at, when the email carries one: the real logo, without a background. */
  logo?: { width: number; height: number };
  /** Whether the company's name is written beside the logo. */
  wordmark?: boolean;
  /**
   * The brand's color, dark enough to read on white: the logo, the eyebrow, the headings, a quoted text's label and
   * bar, and the button. Black when the brand's own color is white.
   */
  color: string;
  /** The button's words, on the brand's color: white by default. */
  onColor?: string;
  /** The headings' font stack, and the rest's; the device's own sans by default. */
  fonts?: { heading?: string; body?: string };
  /** The company's lines at the very bottom of every email (its site). */
  signature?: readonly { text: string; href?: string }[];
}

/** What one email says, in the brand's design. */
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
  /** A longer text keeping its line breaks (a visitor's message), with its label. */
  quote?: { label: string; text: string };
  /** The one thing to do next, as a button: reply, call, visit. */
  button?: { label: string; href: string };
  /** Small print: where it came from, when, and so on. */
  footer?: readonly EmailRow[];
}
