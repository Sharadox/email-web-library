# Changelog

What changed in each version of `@sharadox/email-web-library`, newest first.

## 0.6.0

- **Breaking:** one simple layout for every brand, the same in every mail app. Black on white with every style inline: no `<style>`, no dark-mode rules, no backgrounds but the button's and no gradients, so a mail app in dark mode darkens it as it darkens any email instead of recoloring parts of it (dark designs lost their backgrounds, lines and buttons in Proton Mail on Android). The logo sits at the top left; details stack each label over its value on every screen. `EmailDesign` is now `{ name, logo?, wordmark?, color, onColor?, fonts?, signature? }`: the brand brings its logo, its color (eyebrow, headings, quote bar, button) and its fonts. New exports: `EMAIL_COLORS`, `SYSTEM_FONT`.
