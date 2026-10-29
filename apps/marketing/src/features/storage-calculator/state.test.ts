import {
  defaultState,
  readState,
  writeState,
} from "@marketing/features/storage-calculator/state";
import type {
  CalculatorPage,
  CalculatorState,
} from "@marketing/features/storage-calculator/types";
import { describe, expect, it } from "vitest";

describe("shareable calculator state", () => {
  it.each([
    "backup",
    "s3",
  ] as CalculatorPage[])("round-trips all changed fields on %s", (page) => {
    const state: CalculatorState = {
      storage: 250.5,
      storageUnit: "GB",
      months: 7,
      downloads: 10.1,
      downloadUnit: "GB",
      objectSize: 0.5,
      billing: "yearly",
      advanced: true,
      sort: "provider",
      details: ["one", "two"],
    };
    const params = writeState(
      new URLSearchParams("utm_source=newsletter"),
      state,
      page,
    );
    expect(params.get("utm_source")).toBe("newsletter");
    expect(readState(params, page, ["one", "two"])).toEqual(state);
  });
  it("removes reset values and retains unrelated parameters", () => {
    const params = writeState(
      new URLSearchParams(
        "storage=5&months=2&billing=yearly&details=one&utm_source=test",
      ),
      defaultState("backup"),
      "backup",
    );
    expect(params.toString()).toBe("utm_source=test");
  });
  it("restores defaults for invalid, infinite, out-of-range or fractional duration inputs", () => {
    for (const query of [
      "storage=-1",
      "storage=Infinity",
      "storage=",
      "months=1.5",
      "months=0",
      "months=121",
      "downloads=-2",
      "objectSize=0",
      "objectSize=NaN",
      "storageUnit=bad&billing=other&sort=invalid",
    ]) {
      expect(readState(new URLSearchParams(query), "backup", [])).toEqual(
        defaultState("backup"),
      );
    }
  });
  it("restores only existing page offers and deduplicates detail IDs", () => {
    expect(
      readState(new URLSearchParams("details=one,one,cloudblink,bad"), "s3", [
        "one",
      ]).details,
    ).toEqual(["one"]);
  });
  it("always exposes object size on S3 and persists advanced visibility on backup", () => {
    expect(
      readState(new URLSearchParams("advanced=false"), "s3", []).advanced,
    ).toBe(true);
    expect(
      readState(new URLSearchParams("advanced=true"), "backup", []).advanced,
    ).toBe(true);
    expect(
      writeState(new URLSearchParams(), defaultState("s3"), "s3").toString(),
    ).toBe("");
  });
});
