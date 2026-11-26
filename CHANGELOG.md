# Changelog

What changed in each version of `@sharadox/email-web-library`, newest first.

## 0.8.1

Code boxes are square (48 by 48) and their 8-pixel corners show: their table keeps its borders separate.

## 0.8.0

One-time codes in emails: `code` shows them one box per character, outlined in the line color.

## 0.7.1

Workflows from git-hub-action-library v0.2.2: npm Trusted Publishing only

## 0.7.0

Amazon SES without a password: `EMAIL_SERVER_AMAZON_SES_ROLE` and `EMAIL_SERVER_AMAZON_SES_REGION` send through the Amazon SES API as an AWS role the Vercel deployment takes with its own identity (OIDC), so no SMTP password is stored. New `createAmazonSesSender` (any AWS credential provider) and types `AmazonSesConfiguration`, `AmazonCredentials`, `SmtpServerConfiguration`; `EmailServerConfiguration` is now either kind. SMTP works as before.

## 0.6.1

The lines between details are #E5E5E5, and #1A1A1A in dark themes.

## 0.6.0

- **Breaking:** one layout for every company, the same in every mail app: a centered column 600 pixels wide with 16 pixels around it and no background (the mail app's own shows). The logo, heading, values, company name and site are `#000000`, labels and the rest `#5E5E5E`; in dark themes, where the mail app honors the rules (`@media (prefers-color-scheme: dark)`, and `[data-ogsc]` for Outlook.com, the only styles not inline), `#FFFFFF` and `#A1A1A1`, with the white logo ("logo-dark") instead of the black one (which has a white outline for apps that darken on their own). Spaces are 4, 8, 16 or 32 pixels; Geist where the reader has it, the device's own sans otherwise. Dark designs no longer showed as designed in some apps (Proton Mail on Android).
- **Breaking:** `EmailDesign` is `{ name, logo?, wordmark?, signature? }`; `EmailContent` is `{ language, preview, eyebrow, heading, paragraphs?, rows?, closing? }`: rows take a list (`value: string[]`, a dot per line) or a text keeping its line breaks (`keepLines`), and `closing` signs off with the company's name in bold (the quote, button and small print are gone). `emailLayout`'s third argument takes `{ light, dark }` logos (or `true` for the black one only). New exports: `EMAIL_COLORS`, `EMAIL_FONT`, `EMAIL_SPACES`, `EmailLogos`.
- The lines between details are #5E5E5E in both themes.
