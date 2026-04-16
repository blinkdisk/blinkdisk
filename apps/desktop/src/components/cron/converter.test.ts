import { UNITS } from "@desktop/components/cron/constants";
import {
  formatValue,
  getCronStringFromValues,
} from "@desktop/components/cron/converter";

describe("getCronStringFromValues", () => {
  it('period "minute" returns all wildcards', () => {
    expect(
      getCronStringFromValues(
        "minute",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      ),
    ).toBe("* * * * *");
  });

  it('period "hour" with minutes produces correct cron', () => {
    expect(
      getCronStringFromValues(
        "hour",
        undefined,
        undefined,
        undefined,
        undefined,
        [0, 30],
        undefined,
        undefined,
      ),
    ).toBe("0,30 * * * *");
  });

  it('period "day" with hours and minutes produces correct cron', () => {
    expect(
      getCronStringFromValues(
        "day",
        undefined,
        undefined,
        undefined,
        [9],
        [0],
        undefined,
        undefined,
      ),
    ).toBe("0 9 * * *");
  });

  it('period "week" with weekDays, hours, and minutes produces correct cron', () => {
    expect(
      getCronStringFromValues(
        "week",
        undefined,
        undefined,
        [1, 2, 3, 4, 5],
        [8],
        [0],
        undefined,
        undefined,
      ),
    ).toBe("0 8 * * 1-5");
  });

  it('period "month" with monthDays, hours, and minutes produces correct cron', () => {
    expect(
      getCronStringFromValues(
        "month",
        undefined,
        [1],
        undefined,
        [0],
        [0],
        undefined,
        undefined,
      ),
    ).toBe("0 0 1 * *");
  });

  it('period "year" with all fields produces correct cron', () => {
    expect(
      getCronStringFromValues(
        "year",
        [1],
        [1],
        undefined,
        [0],
        [0],
        undefined,
        undefined,
      ),
    ).toBe("0 0 1 1 *");
  });

  it('period "reboot" returns @reboot', () => {
    expect(
      getCronStringFromValues(
        "reboot",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      ),
    ).toBe("@reboot");
  });

  it("uses interval representation for evenly spaced minutes", () => {
    expect(
      getCronStringFromValues(
        "hour",
        undefined,
        undefined,
        undefined,
        undefined,
        [0, 15, 30, 45],
        undefined,
        undefined,
      ),
    ).toBe("*/15 * * * *");
  });

  it("uses range representation for consecutive hours", () => {
    expect(
      getCronStringFromValues(
        "day",
        undefined,
        undefined,
        undefined,
        [9, 10, 11, 12, 13],
        [0],
        undefined,
        undefined,
      ),
    ).toBe("0 9-13 * * *");
  });
});

describe("formatValue", () => {
  it("formats a basic number", () => {
    expect(formatValue(5, UNITS[0]!)).toBe("5");
  });

  it("adds leading zero when enabled", () => {
    expect(formatValue(5, UNITS[0]!, false, true)).toBe("05");
  });

  it("formats 12-hour clock PM", () => {
    expect(formatValue(14, UNITS[1]!, false, false, "12-hour-clock")).toBe(
      "2PM",
    );
  });

  it("formats 12-hour clock AM", () => {
    expect(formatValue(9, UNITS[1]!, false, false, "12-hour-clock")).toBe(
      "9AM",
    );
  });

  it("humanizes months", () => {
    expect(formatValue(1, UNITS[3]!, true)).toBe("JAN");
  });

  it("humanizes weekdays", () => {
    expect(formatValue(0, UNITS[4]!, true)).toBe("SUN");
  });
});
