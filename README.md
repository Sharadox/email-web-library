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

`emailLayout(content, design, logo)` writes the html of an email in a brand's own look, so every email a company sends looks like its website. The design holds its colors, type, rules, header, button and signature. Fonts are stacks the reader's device already has: web fonts would tell a font service the email was opened. Everything given is escaped, and the layout is tables with inline styles, as email clients need; on phones, details stack under their labels.

```ts
import { emailLayout, type EmailDesign } from "@sharadox/email-web-library";

const design: EmailDesign = {
  name: "Sharadox",
  logo: { width: 30, height: 30 }, // shown size of the inline image "logo"
  wordmark: true, // the name beside the logo
  align: "left",
  colors: {
    page: "#000",
    card: "#000",
    edge: "#262626",
    text: "#fff",
    muted: "#a3a3a3",
    quiet: "#737373",
    rule: "#2e2e2e",
    accent: "#fff",
    box: "#0a0a0a",
    onAccent: "#000",
  },
  fonts: { heading: "Geist, sans-serif", body: "Geist, sans-serif", label: "'Geist Mono', monospace" },
  heading: { size: 34, weight: 600, letterSpacing: "-0.04em", lineHeight: 1.1 },
  label: { size: 11, letterSpacing: "0.06em" },
  rule: "dashed", // between details
  radius: 0,
  crosses: true, // a grid's frame, with "+" where its lines cross
  button: { radius: 999, uppercase: false, letterSpacing: "0" },
  signature: [{ text: "sharadox.com", href: "https://sharadox.com" }],
};

const html = emailLayout(
  {
    language: "en",
    preview: "Ana sent a message",
    eyebrow: "Contact",
    heading: "Ana Sousa",
    rows: [{ label: "Email", value: "ana@example.com", href: "mailto:ana@example.com" }],
    quote: { label: "Message", text: "Hello!" },
    button: { label: "Reply to Ana", href: "mailto:ana@example.com" },
  },
  design,
  true, // the email carries the inline image "logo"
);
```

Optional touches: `colors.accentGradient` (a shiny accent where the device shows gradients), `colors.headerRule` (the line under the header), `eyebrowLine` (a short line before the eyebrow) and `quoteBar` (an accent bar beside a quoted text).

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
