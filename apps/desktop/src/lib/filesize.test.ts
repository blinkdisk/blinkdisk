import { fromBytes, toBytes } from "./filesize";

describe("fromBytes", () => {
  it("returns bytes for values under 1000", () => {
    expect(fromBytes(0)).toEqual({ value: 0, unit: "B" });
    expect(fromBytes(999)).toEqual({ value: 999, unit: "B" });
  });

  it("returns KB for values >= 1000", () => {
    expect(fromBytes(1000)).toEqual({ value: 1, unit: "KB" });
    expect(fromBytes(999_999)).toEqual({ value: 999.999, unit: "KB" });
  });

  it("returns MB for values >= 1_000_000", () => {
    expect(fromBytes(1_000_000)).toEqual({ value: 1, unit: "MB" });
    expect(fromBytes(5_500_000)).toEqual({ value: 5.5, unit: "MB" });
  });

  it("returns GB for values >= 1_000_000_000", () => {
    expect(fromBytes(1_000_000_000)).toEqual({ value: 1, unit: "GB" });
  });

  it("returns TB for values >= 1_000_000_000_000", () => {
    expect(fromBytes(1_000_000_000_000)).toEqual({ value: 1, unit: "TB" });
  });

  it("handles undefined input", () => {
    expect(fromBytes(undefined as unknown as number)).toEqual({
      value: undefined,
      unit: "B",
    });
  });
});

describe("toBytes", () => {
  it("converts B to bytes", () => {
    expect(toBytes({ value: 500, unit: "B" })).toBe(500);
  });

  it("converts KB to bytes", () => {
    expect(toBytes({ value: 1, unit: "KB" })).toBe(1000);
  });

  it("converts MB to bytes", () => {
    expect(toBytes({ value: 1, unit: "MB" })).toBe(1_000_000);
  });

  it("converts GB to bytes", () => {
    expect(toBytes({ value: 1, unit: "GB" })).toBe(1_000_000_000);
  });

  it("converts TB to bytes", () => {
    expect(toBytes({ value: 1, unit: "TB" })).toBe(1_000_000_000_000);
  });

  it("returns undefined for undefined value", () => {
    expect(toBytes({ value: undefined, unit: "MB" })).toBeUndefined();
  });
});

describe("roundtrip", () => {
  it.each([0, 1000, 1_000_000, 1_000_000_000, 1_000_000_000_000])(
    "toBytes(fromBytes(%i)) === %i",
    (bytes) => {
      expect(toBytes(fromBytes(bytes))).toBe(bytes);
    },
  );
});
