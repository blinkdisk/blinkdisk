import { formatSubscriptionEn } from "./format";

describe("formatSubscriptionEn", () => {
  it("formats valid plan with monthly price", () => {
    const result = formatSubscriptionEn(
      { storageGB: 100 },
      { amount: 5, currency: "USD", period: "MONTHLY" },
    );
    expect(result).toContain("GB");
    expect(result).toContain("/mo");
  });

  it("formats valid plan with yearly price", () => {
    const result = formatSubscriptionEn(
      { storageGB: 100 },
      { amount: 50, currency: "USD", period: "YEARLY" },
    );
    expect(result).toContain("GB");
    expect(result).toContain("/yr");
  });

  it("shows question mark for undefined plan", () => {
    const result = formatSubscriptionEn(undefined, {
      amount: 5,
      currency: "USD",
      period: "MONTHLY",
    });
    expect(result).toMatch(/^\? GB/);
  });

  it("shows question marks for undefined price", () => {
    const result = formatSubscriptionEn({ storageGB: 100 }, undefined);
    expect(result).toContain("?/?");
  });

  it("shows all question marks when both undefined", () => {
    const result = formatSubscriptionEn(undefined, undefined);
    expect(result).toBe("? GB (?/?)");
  });

  it("shows dash for unknown period", () => {
    const result = formatSubscriptionEn(
      { storageGB: 100 },
      { amount: 5, currency: "USD", period: "WEEKLY" },
    );
    expect(result).toContain("/-");
  });

  it("formats large storage numbers with locale separators", () => {
    const result = formatSubscriptionEn(
      { storageGB: 1000 },
      { amount: 10, currency: "USD", period: "MONTHLY" },
    );
    // toLocaleString() should add separators (e.g. "1,000" in en-US)
    expect(result).toMatch(/1[,.]000/);
  });
});
