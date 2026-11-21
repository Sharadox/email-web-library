# Changelog

What changed in each version of `@sharadox/email-web-library`, newest first.

## 0.6.0

- Emails say their colors are their own in light and dark in every form a client looks for (meta tags, `color-scheme`, a dark `prefers-color-scheme` rule keeping the same page color), and repeat their styles inside the body for clients that drop the head, so a mail app in dark mode (Proton Mail on Android) shows them as designed.
- A gradient header rule sits over a plain color (`headerRuleColor`, the accent by default), so clients that drop gradients still draw the line.
