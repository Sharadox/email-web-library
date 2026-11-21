# Changelog

What changed in each version of `@sharadox/email-web-library`, newest first.

## 0.6.0

- **Breaking:** one layout for every company, the same in every mail app. No background (the mail app's own shows); the text, the logo and the button are in the theme's foreground color, black, or white in dark mode where the mail app honors the dark theme's rules (`@media (prefers-color-scheme: dark)`, and `[data-ogsc]` for Outlook.com), the only styles not inline. Mail apps that ignore them darken the email their own way, which kept dark designs from showing as designed (Proton Mail on Android). The logo sits at the top left: the inline image "logo" in black with a thin white outline, and "logo-dark" in white for dark themes. Geist where the reader has it, the device's own sans otherwise. Details stack each label over its value, the visitor's message last, alike the others. `EmailDesign` is now `{ name, logo?, wordmark?, signature? }`; `emailLayout`'s third argument takes `{ light, dark }` logos (or `true` for the black one only). New exports: `EMAIL_COLORS`, `EMAIL_FONT`, `EmailLogos`.
