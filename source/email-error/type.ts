/**
 * Why sending failed:
 * - `configuration`: the email server settings are missing or invalid (fix the environment).
 * - `invalid-message`: the message itself is wrong, for example a malformed address (fix the input).
 * - `delivery`: the server could not be reached, refused the login or rejected the message (retry or alert).
 */
export type EmailErrorCode = "configuration" | "invalid-message" | "delivery";
