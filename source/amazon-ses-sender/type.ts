/** Short-lived AWS credentials, as an AWS credential provider gives them. */
export interface AmazonCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  expiration?: Date;
}

/**
 * Sending through the Amazon SES API instead of SMTP, with short-lived credentials (for example a role the
 * deployment takes with its own identity, through Vercel OIDC): no password is stored anywhere.
 */
export interface AmazonSesConfiguration {
  kind: "amazon-ses";
  /** The region the sending identity is verified in, for example "eu-west-1". */
  region: string;
  /** Gives the credentials; asked again whenever they expire (any AWS credential provider fits). */
  credentials: () => Promise<AmazonCredentials>;
  /** Milliseconds to wait for Amazon SES before failing with `delivery`. Defaults to 10 000. */
  timeout?: number;
}
