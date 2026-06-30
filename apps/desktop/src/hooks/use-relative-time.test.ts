import {
  EN_RELATIVE_TIME_FORMATTER,
  formatRelativeTime,
} from "@desktop/hooks/use-relative-time";

const NOW = new Date("2026-01-01T00:00:00.000Z");

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("promotes rounded hour values to days at the day boundary", () => {
    const date = NOW.getTime() + 23.5 * 60 * 60 * 1000;

    expect(formatRelativeTime(date, EN_RELATIVE_TIME_FORMATTER)).toBe(
      "tomorrow",
    );
  });

  it("promotes rounded month values to years at the year boundary", () => {
    const date = NOW.getTime() - 11.8 * 30 * 24 * 60 * 60 * 1000;

    expect(formatRelativeTime(date, EN_RELATIVE_TIME_FORMATTER)).toBe(
      "last year",
    );
  });
});
