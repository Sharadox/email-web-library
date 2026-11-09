import type { EmailErrorCode } from "./type.ts";

/** The only error this library throws; `code` says whose problem it is. */
export class EmailError extends Error {
  readonly code: EmailErrorCode;

  constructor(code: EmailErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "EmailError";
    this.code = code;
  }
}
