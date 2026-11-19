/** One line of a details table or of the small print: a label and its value (plain text, or a link with `href`). */
export interface EmailRow {
  label: string;
  value: string;
  href?: string;
}

/**
 * A brand's look for its emails: colors, type and details, so every email it sends looks like its website. Fonts are
 * font stacks the reader's device already has (no web fonts, which would tell a font service the email was opened).
 */
export interface EmailDesign {
  /** The company: the logo's description, and its name beside the logo with `wordmark`. */
  name: string;
  /** The size the inline image "logo" is shown at, when the email carries one. */
  logo?: { width: number; height: number };
  /** Whether the company's name is written beside the logo. */
  wordmark: boolean;
  /** Where the header and the heading sit. */
  align: "left" | "center";
  colors: {
    /** Around the card. */
    page: string;
    /** The card itself. */
    card: string;
    /** The card's edge. */
    edge: string;
    /** Headings and values. */
    text: string;
    /** Paragraphs. */
    muted: string;
    /** Labels and small print. */
    quiet: string;
    /** Rules between details. */
    rule: string;
    /** The brand's color: the eyebrow, the rule under the header, the button. */
    accent: string;
    /** A CSS gradient over the accent where the reader's device shows one (shiny gold). */
    accentGradient?: string;
    /** The line under the header, as a CSS background, when it isn't the accent (a hairline fading at its ends). */
    headerRule?: string;
    /** Behind a quoted text. */
    box: string;
    /** The button's words. */
    onAccent: string;
  };
  fonts: {
    heading: string;
    body: string;
    /** Eyebrows, labels and small print. */
    label: string;
  };
  heading: { size: number; weight: number; letterSpacing: string; lineHeight: number };
  /** Eyebrows and labels in capitals, spaced. */
  label: { size: number; letterSpacing: string };
  /** The rules between details: solid, or dashed like the brand's grid. */
  rule: "solid" | "dashed";
  /** The card's corners (0 for square). */
  radius: number;
  /** "+" marks at the card's corners, where a grid's lines would cross. */
  crosses?: boolean;
  /** A short line before the eyebrow. */
  eyebrowLine?: boolean;
  /** A bar in the accent at the left of a quoted text. */
  quoteBar?: boolean;
  button: { radius: number; uppercase: boolean; letterSpacing: string };
  /** The company's lines at the very bottom of every email (its slogan, its site). */
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
  /** The details table. */
  rows?: readonly EmailRow[];
  /** A longer text in its own box, keeping its line breaks (a visitor's message), with its label. */
  quote?: { label: string; text: string };
  /** The one thing to do next, as a button: reply, call, visit. */
  button?: { label: string; href: string };
  /** Small print: where it came from, when, and so on. */
  footer?: readonly EmailRow[];
}
