import { fromBits, toBits } from "./bandwith";

describe("fromBits", () => {
  it("returns bps for values under 1000", () => {
    expect(fromBits(0)).toEqual({ value: 0, unit: "bps" });
    expect(fromBits(999)).toEqual({ value: 999, unit: "bps" });
  });

  it("returns Kbps for values >= 1000", () => {
    expect(fromBits(1000)).toEqual({ value: 1, unit: "Kbps" });
    expect(fromBits(500_000)).toEqual({ value: 500, unit: "Kbps" });
  });

  it("returns Mbps for values >= 1_000_000", () => {
    expect(fromBits(1_000_000)).toEqual({ value: 1, unit: "Mbps" });
  });

  it("returns Gbps for values >= 1_000_000_000", () => {
    expect(fromBits(1_000_000_000)).toEqual({ value: 1, unit: "Gbps" });
  });

  it("handles undefined input", () => {
    expect(fromBits(undefined as unknown as number)).toEqual({
      value: undefined,
      unit: "bps",
    });
  });
});

describe("toBits", () => {
  it("converts bps", () => {
    expect(toBits({ value: 500, unit: "bps" })).toBe(500);
  });

  it("converts Kbps", () => {
    expect(toBits({ value: 1, unit: "Kbps" })).toBe(1000);
  });

  it("converts Mbps", () => {
    expect(toBits({ value: 1, unit: "Mbps" })).toBe(1_000_000);
  });

  it("converts Gbps", () => {
    expect(toBits({ value: 1, unit: "Gbps" })).toBe(1_000_000_000);
  });

  it("returns undefined for undefined value", () => {
    expect(toBits({ value: undefined, unit: "Mbps" })).toBeUndefined();
  });
});

describe("roundtrip", () => {
  it.each([0, 1000, 1_000_000, 1_000_000_000])(
    "toBits(fromBits(%i)) === %i",
    (bits) => {
      expect(toBits(fromBits(bits))).toBe(bits);
    },
  );
});
