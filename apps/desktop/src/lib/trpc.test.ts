import { getAccountIdFromHash } from "@desktop/lib/trpc";

describe("getAccountIdFromHash", () => {
  it("reads the account from app routes", () => {
    expect(getAccountIdFromHash("#/acct_1")).toBe("acct_1");
    expect(getAccountIdFromHash("#/acct_1/vlt_1/settings")).toBe("acct_1");
  });

  it("reads the account from onboarding routes", () => {
    expect(getAccountIdFromHash("#/onboarding/acct_1")).toBe("acct_1");
    expect(getAccountIdFromHash("#/onboarding/acct_1/vlt_1")).toBe("acct_1");
  });

  it("ignores search params", () => {
    expect(getAccountIdFromHash("#/acct_1?tab=billing")).toBe("acct_1");
    expect(getAccountIdFromHash("#/onboarding/acct_1?step=2")).toBe("acct_1");
  });

  it("returns undefined without an account", () => {
    expect(getAccountIdFromHash("")).toBeUndefined();
    expect(getAccountIdFromHash("#/")).toBeUndefined();
    expect(getAccountIdFromHash("#/onboarding")).toBeUndefined();
    expect(getAccountIdFromHash("#/onboarding?step=2")).toBeUndefined();
    expect(getAccountIdFromHash("#/?step=2")).toBeUndefined();
  });
});
