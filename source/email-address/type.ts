/** An address as text (`"person@example.com"`) or with a display name. */
export type EmailAddress = string | { name: string; address: string };
