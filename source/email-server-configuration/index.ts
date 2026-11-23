import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";
import { EmailError } from "@sharadox/email-web-library/email-error";
import type {
  EmailServerConfiguration,
  EmailServerSecurity,
} from "@sharadox/email-web-library/email-server-configuration/type";

const SECURITIES: readonly EmailServerSecurity[] = ["starttls", "tls", "none"];

/**
 * Reads the email server settings from environment variables. With `EMAIL_SERVER_AMAZON_SES_ROLE` (a role's ARN)
 * and `EMAIL_SERVER_AMAZON_SES_REGION`, it sends through Amazon SES as that role, taken with the deployment's own
 * Vercel OIDC identity: nothing secret is stored. Otherwise it reads an SMTP server:
 * `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT` (default 587), `EMAIL_SERVER_USERNAME`, `EMAIL_SERVER_PASSWORD` and the
 * optional `EMAIL_SERVER_SECURITY` (`starttls`, `tls` or `none`). Pass another `prefix` to keep several servers.
 * Throws `configuration` naming every missing or invalid variable.
 */
export function readEmailServerConfiguration(
  environment: Record<string, string | undefined> = process.env,
  prefix = "EMAIL_SERVER_",
): EmailServerConfiguration {
  const read = (name: string) => environment[`${prefix}${name}`]?.trim() || undefined;
  const role = read("AMAZON_SES_ROLE");
  if (role) {
    const region = read("AMAZON_SES_REGION");
    if (!region) throw new EmailError("configuration", `${prefix}AMAZON_SES_REGION is missing`);
    return { kind: "amazon-ses", region, credentials: awsCredentialsProvider({ roleArn: role }) };
  }
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
