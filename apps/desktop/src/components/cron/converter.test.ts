import { CRON_UNITS } from "@desktop/components/cron/constants";
import {
  formatCronExpression,
  formatCronValue,
  getCronStringFromValues,
  parseCronExpression,
} from "@desktop/components/cron/converter";

describe("parseCronExpression", () => {
  it("parses a daily expression", () => {
    expect(parseCronExpression("0 0 * * *")).toEqual({
      period: "day",
      minutes: [0],
      hours: [0],
      monthDays: [],
      months: [],
      weekDays: [],
    });
  });

  it("parses ranges, intervals, and names", () => {
    expect(parseCronExpression("*/15 9-17 * JAN,MAR MON-FRI")).toEqual({
      period: "year",
      minutes: [0, 15, 30, 45],
      hours: [9, 10, 11, 12, 13, 14, 15, 16, 17],
      monthDays: [],
      months: [1, 3],
      weekDays: [1, 2, 3, 4, 5],
    });
  });

  it("normalizes Sunday from 7 to 0", () => {
    expect(parseCronExpression("0 0 * * 7")?.weekDays).toEqual([0]);
  });

  it("parses supported shortcuts", () => {
    expect(parseCronExpression("@weekly")).toEqual({
      period: "week",
      minutes: [0],
      hours: [0],
      monthDays: [],
      months: [],
      weekDays: [0],
    });
  });

  it("returns null for invalid expressions", () => {
    expect(parseCronExpression("0 0 32 * *")).toBeNull();
    expect(parseCronExpression("1e2 0 * * *")).toBeNull();
    expect(parseCronExpression("@reboot")).toBeNull();
    expect(parseCronExpression("not cron")).toBeNull();
  });
});

describe("formatCronExpression", () => {
  it('period "minute" returns all wildcards', () => {
    expect(
      formatCronExpression({
        period: "minute",
        minutes: [],
        hours: [],
        monthDays: [],
        months: [],
        weekDays: [],
      }),
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
      ),
    ).toBe("*/30 * * * *");
  });

  it('period "day" with hours and minutes produces correct cron', () => {
    expect(
      getCronStringFromValues("day", undefined, undefined, undefined, [9], [0]),
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
      ),
    ).toBe("0 8 * * 1-5");
  });

  it('period "month" with monthDays, hours, and minutes produces correct cron', () => {
    expect(
      getCronStringFromValues("month", undefined, [1], undefined, [0], [0]),
    ).toBe("0 0 1 * *");
  });

  it('period "year" with all fields produces correct cron', () => {
    expect(getCronStringFromValues("year", [1], [1], undefined, [0], [0])).toBe(
      "0 0 1 1 *",
    );
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
      ),
    ).toBe("0 9-13 * * *");
  });
});

describe("formatCronValue", () => {
  it("formats a basic number", () => {
    expect(formatCronValue(5, CRON_UNITS.minutes)).toBe("5");
  });

  it("adds leading zero in 24-hour clock labels", () => {
    expect(
      formatCronValue(5, CRON_UNITS.minutes, {
        clockFormat: "24-hour-clock",
      }),
    ).toBe("05");
  });

  it("formats 12-hour clock PM", () => {
    expect(
      formatCronValue(14, CRON_UNITS.hours, {
        clockFormat: "12-hour-clock",
      }),
    ).toBe("2PM");
  });

  it("uses supplied labels", () => {
    expect(
      formatCronValue(1, CRON_UNITS.months, {
        labels: ["January"],
      }),
    ).toBe("January");
  });
});
