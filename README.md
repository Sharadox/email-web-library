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

`sender.verify()` logs in without sending, handy for a health check. `checkEmailMessage` and `checkEmailAddress` are exported for validating input before you get as far as sending.

## Development

Built on the Sharadox engineering standard: TypeScript in `source/` (one thing per folder: `index.ts`, `type.ts`, `unit-test.ts`, `benchmark-test.ts`), Turborepo, ESLint, Prettier, Vitest, TypeDoc, Husky.

```sh
pnpm install
pnpm verify          # format, lint, types, unit and benchmark tests, build
pnpm documentation   # API reference in documentation/
```

Branches: `index` is released, `pre-production` gathers finished work, and each change lives on `<thing>.development`. Releases are a `v<version>` tag on `index`; the publish workflow releases to npm with provenance.

## License

[MIT](LICENSE) © Sharadox
