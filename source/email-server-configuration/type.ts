/**
 * How the connection is protected:
 * - `starttls`: connect in plain text, then upgrade with STARTTLS, which is required (port 587, the default).
 * - `tls`: TLS from the first byte (port 465).
 * - `none`: no encryption, only for a local test server.
 */
export type EmailServerSecurity = "starttls" | "tls" | "none";

/** Where and how to log in to the SMTP server that sends the email. */
export interface EmailServerConfiguration {
  host: string;
  port: number;
  username: string;
  password: string;
  /** Defaults to `tls` on port 465 and `starttls` everywhere else. */
  security?: EmailServerSecurity;
  /** Milliseconds to wait for the server before failing with `delivery`. Defaults to 10 000. */
  timeout?: number;
}
