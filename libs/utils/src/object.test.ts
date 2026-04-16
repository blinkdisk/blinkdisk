import { removeEmptyStrings } from "./object";

describe("removeEmptyStrings", () => {
  it("removes top-level empty strings", () => {
    expect(removeEmptyStrings({ a: "", b: "hello" })).toEqual({ b: "hello" });
  });

  it("preserves non-string falsy values", () => {
    expect(removeEmptyStrings({ a: 0, b: false, c: null })).toEqual({
      a: 0,
      b: false,
      c: null,
    });
  });

  it("handles nested objects", () => {
    expect(removeEmptyStrings({ a: { b: "", c: "ok" } })).toEqual({
      a: { c: "ok" },
    });
  });

  it("removes nested objects that become empty", () => {
    expect(removeEmptyStrings({ a: { b: "" } })).toEqual({});
  });

  it("preserves arrays", () => {
    expect(removeEmptyStrings({ a: [1, 2] })).toEqual({ a: [1, 2] });
  });

  it("handles empty input", () => {
    expect(removeEmptyStrings({})).toEqual({});
  });

  it("handles deeply nested empty strings", () => {
    expect(removeEmptyStrings({ a: { b: { c: "" } } })).toEqual({});
  });

  it("handles mixed values correctly", () => {
    expect(
      removeEmptyStrings({
        a: "keep",
        b: "",
        c: 42,
        d: { e: "", f: "yes" },
      }),
    ).toEqual({
      a: "keep",
      c: 42,
      d: { f: "yes" },
    });
  });
});
