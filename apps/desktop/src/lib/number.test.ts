import { formatInt, formatSize } from "@desktop/lib/number";

describe("formatSize", () => {
  it.each([0, 1000, 1_000_000, 1_000_000_000])(
    "returns a string for size %i",
    (size) => {
      const result = formatSize(size);
      expect(typeof result).toBe("string");
      expect(String(result).length).toBeGreaterThan(0);
    },
  );

  it("result contains expected unit indicators", () => {
    expect(String(formatSize(0))).toContain("B");
    expect(String(formatSize(1_000_000))).toContain("MB");
    expect(String(formatSize(1_000_000_000))).toContain("GB");
  });
});

describe("formatInt", () => {
  it("formats numbers without decimals", () => {
    expect(formatInt(42)).not.toContain(".");
    expect(formatInt(3.7)).not.toContain(".");
  });

  it("handles zero", () => {
    expect(formatInt(0)).toBe("0");
  });

  it("handles large numbers", () => {
    const result = formatInt(1_000_000);
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toContain(".");
  });
});
