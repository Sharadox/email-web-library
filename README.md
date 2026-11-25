# @sharadox/email-web-library

Send email from web applications — contact forms, notifications, receipts — through **any SMTP server**: your existing mailbox provider (Proton, Google Workspace, Microsoft 365, Fastmail…) or a sending service (Amazon SES, Postmark, Resend…). Switching provider is a change of four environment variables. On Vercel it can also send through **Amazon SES without any stored password**: the deployment takes an AWS role with its own identity (Vercel OIDC).

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
`…/amazon-ses-sender`, `…/email-layout`, `…/email-server-configuration`, `…/email-message`, `…/email-address`, `…/email-error`, `…/inline-image`, which turns a base64 image such as a logo into one to send). The root
import (`@sharadox/email-web-library`) still works in 0.5 and goes away in 0.6.

Set the server in the environment:

| Variable                | Example                   | Notes                                                                                           |
| ----------------------- | ------------------------- | ----------------------------------------------------------------------------------------------- |
| `EMAIL_SERVER_HOST`     | `smtp.protonmail.ch`      |                                                                                                 |
| `EMAIL_SERVER_PORT`     | `587`                     | Optional, 587 by default                                                                        |
| `EMAIL_SERVER_USERNAME` | `website@example.com`     |                                                                                                 |
| `EMAIL_SERVER_PASSWORD` | an SMTP token or password | Keep it in your host's secret store, never in the repository                                    |
| `EMAIL_SERVER_SECURITY` | `starttls`                | Optional: `starttls` (default), `tls` (default on port 465) or `none` (local test servers only) |

### Amazon SES without a password (Vercel OIDC)

Set these two instead, and the SMTP variables are ignored:

| Variable                         | Example                                        | Notes                                                   |
| -------------------------------- | ---------------------------------------------- | ------------------------------------------------------- |
| `EMAIL_SERVER_AMAZON_SES_ROLE`   | `arn:aws:iam::123456789012:role/email-sending` | The role the deployment takes; not a secret             |
| `EMAIL_SERVER_AMAZON_SES_REGION` | `eu-west-1`                                    | The region the sending address or domain is verified in |

The Vercel project needs OIDC on (Settings → Security), and AWS an identity provider for `oidc.vercel.com/<team>` (audience `https://vercel.com/<team>`) that the role trusts, with a trust condition on the project's `sub` (`owner:<team>:project:<project>:environment:production`) and a policy allowing only `ses:SendRawEmail` and `ses:SendEmail` from the sending address. Credentials last an hour and are renewed by themselves; there is nothing to rotate. Elsewhere, pass any AWS credential provider yourself:

```ts
import { createAmazonSesSender } from "@sharadox/email-web-library/amazon-ses-sender";
import { fromEnv } from "@aws-sdk/credential-providers";

const sender = createAmazonSesSender({ kind: "amazon-ses", region: "eu-west-1", credentials: fromEnv() });
```

Amazon SES takes every recipient or refuses the message, so `rejected` is always empty. `verify()` gets the credentials (proving the role) without sending anything.

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

### In the company's layout

`emailLayout(content, design, logos)` writes the html of an email that looks the same in every mail app: a centered column 600 pixels wide with 16 pixels around it, and no background (the mail app's own shows). The logo, the heading, the values, the company's name and its site are black (`#000000`), the labels and the rest gray (`#5E5E5E`); in a dark theme, where the mail app honors it (Apple Mail, Outlook on phones and Macs, Outlook.com and others), they turn white (`#FFFFFF`) and light gray (`#A1A1A1`) and the white logo shows instead. Mail apps that ignore it darken the email their own way. Spaces are 4, 8, 16 or 32 pixels. The font is Geist where the reader has it, the device's own sans otherwise (no web fonts, which would tell a font service the email was opened). Everything given is escaped.

```ts
import { emailLayout } from "@sharadox/email-web-library/email-layout";
import type { EmailDesign } from "@sharadox/email-web-library/email-layout/type";

const design: EmailDesign = {
  name: "Sharadox", // beside the logo with wordmark, and in the sign-off
  logo: { width: 30, height: 30 }, // shown size of the inline images "logo" (black) and "logo-dark" (white)
  wordmark: true,
  signature: [{ text: "sharadox.com", href: "https://sharadox.com" }], // at the very end
};

const html = emailLayout(
  {
    language: "en",
    preview: "Thank you, Ana.",
    eyebrow: "Contact",
    heading: "Thank you, Ana.",
    paragraphs: ["Your message has reached us…"],
    code: { label: "Code", value: "123456" }, // a one-time code: one box per character, outlined in the line color
    rows: [
      { label: "Email", value: "ana@example.com", href: "mailto:ana@example.com" },
      { label: "Needs", value: ["Website", "Hosting"] }, // a list: one item per line after a dot
      { label: "Message", value: "Hello!\nSee you.", keepLines: true },
    ],
    closing: "Best regards,", // then the company's name in bold
  },
  design,
  { light: true, dark: true }, // the logos the email carries: "logo" and "logo-dark" (true: "logo" only)
);
```

The black logo should carry a thin white outline: it stays visible where a mail app darkens the email itself. `EMAIL_COLORS` holds both palettes, `EMAIL_SPACES` the spaces and `EMAIL_FONT` the font stack.

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
