import { describe, expect, it } from "vitest";
import { checkEmailAddress } from "./index.ts";

describe("checkEmailAddress", () => {
  it("accepts plain and named addresses", () => {
    expect(checkEmailAddress("person@example.com", "to")).toBe("person@example.com");
    const named = { name: "Ana Sá", address: "ana@example.pt" };
    expect(checkEmailAddress(named, "from")).toBe(named);
  });

  it.each(["", "person", "person@example", "two@@example.com", "a b@example.com", "<x>@example.com"])(
    "rejects %j",
    (address) => {
      expect(() => checkEmailAddress(address, "to")).toThrow(expect.objectContaining({ code: "invalid-message" }));
    },
  );

  it("rejects header injection through an address or a display name", () => {
    expect(() => checkEmailAddress("person@example.com\r\nBcc: victim@example.com", "replyTo")).toThrow();
    expect(() => checkEmailAddress({ name: "Ana\nBcc: x@example.com", address: "a@example.com" }, "from")).toThrow();
  });
});
