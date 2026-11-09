import { describe, expect, it } from "vitest";
import { readEmailServerConfiguration } from "./index.ts";

const environment = {
  EMAIL_SERVER_HOST: "smtp.example.com",
  EMAIL_SERVER_USERNAME: "website@example.com",
  EMAIL_SERVER_PASSWORD: "secret",
};

describe("readEmailServerConfiguration", () => {
  it("reads the variables with port 587 by default", () => {
    expect(readEmailServerConfiguration(environment)).toEqual({
      host: "smtp.example.com",
      port: 587,
      username: "website@example.com",
      password: "secret",
    });
  });

  it("reads an explicit port, security and prefix", () => {
    const configuration = readEmailServerConfiguration(
      {
        MARKETING_HOST: "smtp.example.com",
        MARKETING_PORT: "465",
        MARKETING_SECURITY: "tls",
        MARKETING_USERNAME: "a",
        MARKETING_PASSWORD: "b",
      },
      "MARKETING_",
    );
    expect(configuration).toMatchObject({ port: 465, security: "tls" });
  });

  it("names every problem at once", () => {
    expect(() => readEmailServerConfiguration({ EMAIL_SERVER_PORT: "smtp", EMAIL_SERVER_SECURITY: "ssl" })).toThrow(
      "EMAIL_SERVER_HOST is missing; EMAIL_SERVER_USERNAME is missing; EMAIL_SERVER_PASSWORD is missing; " +
        "EMAIL_SERVER_PORT must be a port number; EMAIL_SERVER_SECURITY must be one of starttls, tls, none",
    );
  });
});
