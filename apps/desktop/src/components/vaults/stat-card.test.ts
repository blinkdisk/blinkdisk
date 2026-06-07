import { getHistoryTrend } from "@desktop/components/vaults/stat-card";

describe("getHistoryTrend", () => {
  it.each([
    { history: [10, 10, 10], name: "steady history" },
    { history: [0, 0, 0], name: "all-zero history" },
    { history: undefined, name: "missing history" },
  ])("returns flat for $name", ({ history }) => {
    expect(getHistoryTrend(history)).toEqual({
      direction: "flat",
      percent: 0,
    });
  });

  it("returns up for positive change", () => {
    expect(getHistoryTrend([10, 15])).toEqual({
      direction: "up",
      percent: 50,
    });
  });

  it("returns down for negative change", () => {
    expect(getHistoryTrend([10, 5])).toEqual({
      direction: "down",
      percent: 50,
    });
  });
});
