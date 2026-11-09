import { EmailError } from "../email-error/index.ts";
import type { EmailServerConfiguration, EmailServerSecurity } from "./type.ts";

const SECURITIES: readonly EmailServerSecurity[] = ["starttls", "tls", "none"];

/**
 * Reads the email server settings from environment variables:
 * `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT` (default 587), `EMAIL_SERVER_USERNAME`, `EMAIL_SERVER_PASSWORD` and the
 * optional `EMAIL_SERVER_SECURITY` (`starttls`, `tls` or `none`). Pass another `prefix` to keep several servers.
 * Throws `configuration` naming every missing or invalid variable.
 */
export function readEmailServerConfiguration(
  environment: Record<string, string | undefined> = process.env,
  prefix = "EMAIL_SERVER_",
): EmailServerConfiguration {
  const read = (name: string) => environment[`${prefix}${name}`]?.trim() || undefined;
  const host = read("HOST");
  const username = read("USERNAME");
  const password = read("PASSWORD");
  const port = Number(read("PORT") ?? 587);
  const security = read("SECURITY");
  const problems = [
    ...(["HOST", "USERNAME", "PASSWORD"] as const)
      .filter((name) => !read(name))
      .map((name) => `${prefix}${name} is missing`),
    ...(Number.isInteger(port) && port > 0 && port < 65536 ? [] : [`${prefix}PORT must be a port number`]),
    ...(security === undefined || SECURITIES.includes(security as EmailServerSecurity)
      ? []
      : [`${prefix}SECURITY must be one of ${SECURITIES.join(", ")}`]),
  ];
  if (problems.length) throw new EmailError("configuration", problems.join("; "));
  return {
    host: host!,
    port,
    username: username!,
    password: password!,
    ...(security ? { security: security as EmailServerSecurity } : {}),
  };
}
