# @sharadox/email-web-library

Send email from web applications — contact forms, notifications, receipts — through **any SMTP server**: your existing mailbox provider (Proton, Google Workspace, Microsoft 365, Fastmail…) or a sending service (Amazon SES, Postmark, Resend…). No provider SDK, no cloud account; switching provider is a change of four environment variables.

- Checks every message before it leaves: valid addresses, a one-line subject, a body — so form input can't inject extra headers or recipients.
- One error type, `EmailError`, whose `code` says whose problem it is: `configuration`, `invalid-message` or `delivery`.
- One short connection per message, which suits serverless functions (Next.js server actions, Vercel functions).
- Typed, tested against a real SMTP server, ESM only. The SMTP protocol work is done by [Nodemailer](https://nodemailer.com).

## Install

```sh
pnpm add @sharadox/email-web-library
```

## Use

Import each part from its own path, like every Sharadox library (`@sharadox/email-web-library/email-sender`,
`…/email-layout`, `…/email-server-configuration`, `…/email-message`, `…/email-address`, `…/email-error`, `…/inline-image`, which turns a base64 image such as a logo into one to send). The root
import (`@sharadox/email-web-library`) still works in 0.5 and goes away in 0.6.

Set the server in the environment:

| Variable                | Example                   | Notes                                                                                           |
| ----------------------- | ------------------------- | ----------------------------------------------------------------------------------------------- |
| `EMAIL_SERVER_HOST`     | `smtp.protonmail.ch`      |                                                                                                 |
| `EMAIL_SERVER_PORT`     | `587`                     | Optional, 587 by default                                                                        |
| `EMAIL_SERVER_USERNAME` | `website@example.com`     |                                                                                                 |
| `EMAIL_SERVER_PASSWORD` | an SMTP token or password | Keep it in your host's secret store, never in the repository                                    |
| `EMAIL_SERVER_SECURITY` | `starttls`                | Optional: `starttls` (default), `tls` (default on port 465) or `none` (local test servers only) |

```ts
"use server";
import { createEmailSender, EmailError, readEmailServerConfiguration } from "@sharadox/email-web-library";

export async function sendContact(name: string, email: string, text: string) {
  try {
    const sender = createEmailSender(readEmailServerConfiguration());
    await sender.send({
      from: { name: "Website", address: "website@example.com" }, // usually must be the login address or an alias
      to: "inbox@example.com",
      replyTo: { name, address: email }, // replying goes straight to the visitor
      subject: `New message from ${name}`,
      text,
    });
    return { sent: true };
  } catch (error) {
    if (error instanceof EmailError && error.code === "invalid-message")
      return { sent: false, reason: "check-the-form" };
    console.error(error); // configuration or delivery: tell the visitor to write directly
    return { sent: false, reason: "unavailable" };
  }
}
```

Images inside the html (a logo at the top, say) go in `inlineImages`, each referred to as `cid:<id>`, so they show without loading anything from the internet:

```ts
await sender.send({
  ...message,
  html: '<img src="cid:logo" alt="Sharadox">',
  inlineImages: [{ id: "logo", filename: "logo.png", contentType: "image/png", content: png }],
});
```

### In the brand's design

`emailLayout(content, design, logo)` writes the html of an email that looks the same in every mail app: one simple layout, black on white, with every style inline and nothing for a mail app to drop or recolor its own way (no dark-mode rules, no backgrounds but the button's, no gradients). In dark mode the mail app darkens it as it darkens any email. A brand brings only what makes it its own: the logo at the top left (the real logo, without a background), its color on the eyebrow, the headings, the bar beside a quoted text and the button, and its fonts. Fonts are stacks the reader's device already has: web fonts would tell a font service the email was opened. Everything given is escaped; details stack each label over its value, the same on a phone and a computer.

```ts
import { emailLayout } from "@sharadox/email-web-library/email-layout";
import type { EmailDesign } from "@sharadox/email-web-library/email-layout/type";

const design: EmailDesign = {
  name: "Sharadox",
  logo: { width: 30, height: 30 }, // shown size of the inline image "logo"
  wordmark: true, // the name beside the logo
  color: "#000000", // the brand's color, dark enough to read on white (black for a white brand)
  fonts: { heading: "Geist, Helvetica, Arial, sans-serif" }, // the body's font and the device's own sans otherwise
  signature: [{ text: "sharadox.com", href: "https://sharadox.com" }],
};

const html = emailLayout(
  {
    language: "en",
    preview: "Ana sent a message",
    eyebrow: "Contact",
    heading: "Ana (Villa Mar)",
    rows: [{ label: "Email", value: "ana@example.com", href: "mailto:ana@example.com" }],
    quote: { label: "Message", text: "Hello!" },
    button: { label: "Reply to Ana", href: "mailto:ana@example.com" },
    footer: [{ label: "Sent", value: "2026-11-21 14:29 UTC" }],
  },
  design,
  true, // the email carries the inline image "logo"
);
```

`EMAIL_COLORS` is the shared palette (background, text, muted, quiet, line) and `SYSTEM_FONT` the default font stack.

`sender.verify()` logs in without sending, handy for a health check. `checkEmailMessage` and `checkEmailAddress` are exported for validating input before you get as far as sending.

## Development

Built on the Sharadox engineering standard: TypeScript in `source/` (one thing per folder: `index.ts`, `type.ts`, `unit-test.ts`, `benchmark-test.ts`), Turborepo, ESLint, Prettier, Vitest, TypeDoc, Husky.

```sh
pnpm install
pnpm verify          # format, lint, types, unit and benchmark tests, build
pnpm documentation   # API reference in documentation/
```

Branches: `index` is released, `development` gathers finished work, and each change lives on `<feature>.development`. Releases are a `v<version>` tag on `index`; the publish workflow releases to npm with provenance, using the organization's `NPM_TOKEN`.

## License

Licença Sharadox de Código Aberto, versão 0.1.0 ([português](LICENCA.md), the binding text · [English translation](LICENSE.md)). Versions up to 0.1.0 were published under the MIT license.
