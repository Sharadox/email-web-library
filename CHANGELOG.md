# Changelog

What changed in each version of `@sharadox/email-web-library`, newest first.

## 0.6.0

- **Breaking:** one layout for every company, the same in every mail app: a centered column 600 pixels wide with 16 pixels around it and no background (the mail app's own shows). The logo, heading, values, company name and site are `#000000`, labels and the rest `#5E5E5E`; in dark themes, where the mail app honors the rules (`@media (prefers-color-scheme: dark)`, and `[data-ogsc]` for Outlook.com, the only styles not inline), `#FFFFFF` and `#A1A1A1`, with the white logo ("logo-dark") instead of the black one (which has a white outline for apps that darken on their own). Spaces are 4, 8, 16 or 32 pixels; Geist where the reader has it, the device's own sans otherwise. Dark designs no longer showed as designed in some apps (Proton Mail on Android).
- **Breaking:** `EmailDesign` is `{ name, logo?, wordmark?, signature? }`; `EmailContent` is `{ language, preview, eyebrow, heading, paragraphs?, rows?, closing? }`: rows take a list (`value: string[]`, a dot per line) or a text keeping its line breaks (`keepLines`), and `closing` signs off with the company's name in bold (the quote, button and small print are gone). `emailLayout`'s third argument takes `{ light, dark }` logos (or `true` for the black one only). New exports: `EMAIL_COLORS`, `EMAIL_FONT`, `EMAIL_SPACES`, `EmailLogos`.
- The lines between details are #5E5E5E in both themes.
