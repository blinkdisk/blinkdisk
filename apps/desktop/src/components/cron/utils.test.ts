import { DEFAULT_LOCALE_EN } from "@desktop/components/cron/locale";
import {
  convertStringToNumber,
  dedup,
  range,
  setError,
  sort,
} from "@desktop/components/cron/utils";

describe("range", () => {
  it("creates an inclusive range from start to end", () => {
    expect(range(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("returns a single-element array when start equals end", () => {
    expect(range(0, 0)).toEqual([0]);
  });

  it("returns an empty array when start is greater than end", () => {
    expect(range(5, 3)).toEqual([]);
  });
});

describe("sort", () => {
  it("sorts numbers ascending", () => {
    expect(sort([3, 1, 4, 1, 5])).toEqual([1, 1, 3, 4, 5]);
  });

  it("handles empty array", () => {
    expect(sort([])).toEqual([]);
  });

  it("handles already sorted array", () => {
    expect(sort([1, 2, 3])).toEqual([1, 2, 3]);
  });
});

describe("dedup", () => {
  it("removes duplicates", () => {
    expect(dedup([1, 1, 2, 3, 3])).toEqual([1, 2, 3]);
  });

  it("preserves order", () => {
    expect(dedup([3, 1, 3, 2, 1])).toEqual([3, 1, 2]);
  });

  it("handles empty array", () => {
    expect(dedup([])).toEqual([]);
  });
});

describe("convertStringToNumber", () => {
  it("converts valid integer strings", () => {
    expect(convertStringToNumber("5")).toBe(5);
    expect(convertStringToNumber("0")).toBe(0);
  });

  it("rejects float strings", () => {
    expect(convertStringToNumber("1.5")).toBeNaN();
  });

  it("rejects hex strings", () => {
    expect(convertStringToNumber("0x10")).toBeNaN();
  });

  it("rejects empty string", () => {
    expect(convertStringToNumber("")).toBeNaN();
  });

  it("rejects non-numeric strings", () => {
    expect(convertStringToNumber("abc")).toBeNaN();
  });
});

describe("setError", () => {
  it("calls onError with correct error object", () => {
    const onError = vi.fn();
    setError(onError, {});

    expect(onError).toHaveBeenCalledWith({
      type: "invalid_cron",
      description: DEFAULT_LOCALE_EN.errorInvalidCron,
    });
  });

  it("uses locale errorInvalidCron when provided", () => {
    const onError = vi.fn();
    setError(onError, { errorInvalidCron: "Custom error" });

    expect(onError).toHaveBeenCalledWith({
      type: "invalid_cron",
      description: "Custom error",
    });
  });

  it("does nothing when onError is undefined", () => {
    expect(() => setError(undefined, {})).not.toThrow();
  });
});
