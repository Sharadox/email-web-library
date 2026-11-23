import { describe, expect, it, vi } from "vitest";

const { awsCredentialsProvider } = vi.hoisted(() => ({
  awsCredentialsProvider: vi.fn((options: { roleArn: string }) => ({ role: options.roleArn })),
}));
vi.mock("@vercel/oidc-aws-credentials-provider", () => ({ awsCredentialsProvider }));
import { readEmailServerConfiguration } from "@sharadox/email-web-library/email-server-configuration";

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

  it("reads an Amazon SES role instead: credentials from the deployment's own identity (Vercel OIDC), no password", () => {
    const configuration = readEmailServerConfiguration({
      EMAIL_SERVER_AMAZON_SES_ROLE: "arn:aws:iam::123456789012:role/email-sending",
      EMAIL_SERVER_AMAZON_SES_REGION: "eu-west-1",
      // SMTP settings left behind are ignored once a role is set.
      EMAIL_SERVER_HOST: "smtp.example.com",
    });
    expect(configuration).toEqual({
      kind: "amazon-ses",
      region: "eu-west-1",
      credentials: { role: "arn:aws:iam::123456789012:role/email-sending" },
    });
    expect(awsCredentialsProvider).toHaveBeenCalledWith({ roleArn: "arn:aws:iam::123456789012:role/email-sending" });
    expect(() => readEmailServerConfiguration({ EMAIL_SERVER_AMAZON_SES_ROLE: "arn" })).toThrow(
      "EMAIL_SERVER_AMAZON_SES_REGION is missing",
    );
  });
});
