import { buildSourceId, parseSourceId } from "@desktop/lib/source";

describe("source IDs", () => {
  it("builds Kopia source IDs in user@device:path order", () => {
    expect(
      buildSourceId({
        device: "macbook",
        user: "paul",
        path: "/Users/paul/Documents",
      }),
    ).toBe("paul@macbook:/Users/paul/Documents");
  });

  it("roundtrips source ID parts", () => {
    const parts = {
      device: "macbook",
      user: "paul",
      path: "/Users/paul/Documents",
    };

    expect(parseSourceId(buildSourceId(parts))).toEqual(parts);
  });

  it("keeps separators that belong to the path", () => {
    expect(parseSourceId("paul@macbook:/Volumes/Photos:2026/@raw")).toEqual({
      device: "macbook",
      user: "paul",
      path: "/Volumes/Photos:2026/@raw",
    });
  });

  it("supports Windows-style paths", () => {
    expect(parseSourceId("paul@desktop:C:\\Users\\paul\\Documents")).toEqual({
      device: "desktop",
      user: "paul",
      path: "C:\\Users\\paul\\Documents",
    });
  });

  it("allows empty devices to match Kopia explicit source parsing", () => {
    expect(parseSourceId("paul@:/Users/paul/Documents")).toEqual({
      device: "",
      user: "paul",
      path: "/Users/paul/Documents",
    });
  });

  it("rejects values that are not explicit source IDs", () => {
    expect(parseSourceId("")).toBeNull();
    expect(parseSourceId("(global)")).toBeNull();
    expect(parseSourceId("/Users/paul/Documents")).toBeNull();
    expect(parseSourceId("paul@macbook")).toBeNull();
    expect(parseSourceId("@macbook:/Users/paul/Documents")).toBeNull();
    expect(parseSourceId("paul@macbook:")).toBeNull();
    expect(parseSourceId("paul:/Users/paul/Documents@macbook")).toBeNull();
  });
});
