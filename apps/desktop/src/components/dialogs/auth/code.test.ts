import { isAuthorizationCode } from "@desktop/components/dialogs/auth/code";

describe("isAuthorizationCode", () => {
  it("accepts the encoded identifier and state from the browser sign-in", () => {
    const code = Buffer.from(
      JSON.stringify({ identifier: "one-time-code", state: "pkce-state" }),
    ).toString("base64url");

    expect(isAuthorizationCode(code)).toBe(true);
  });

  it("rejects ordinary clipboard text and incomplete codes", () => {
    expect(isAuthorizationCode("ordinary clipboard text")).toBe(false);
    expect(isAuthorizationCode("not-a-code")).toBe(false);
    expect(
      isAuthorizationCode(
        Buffer.from(JSON.stringify({ identifier: "one-time-code" })).toString(
          "base64url",
        ),
      ),
    ).toBe(false);
    expect(
      isAuthorizationCode(
        Buffer.from(JSON.stringify({ state: "pkce-state" })).toString(
          "base64url",
        ),
      ),
    ).toBe(false);
  });
});
