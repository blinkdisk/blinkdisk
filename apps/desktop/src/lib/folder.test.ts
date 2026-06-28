import { buildFolderId, parseFolderId } from "@desktop/lib/folder";

describe("folder IDs", () => {
  it("builds Kopia source IDs in user@device:path order", () => {
    expect(
      buildFolderId({
        device: "macbook",
        user: "paul",
        path: "/Users/paul/Documents",
      }),
    ).toBe("paul@macbook:/Users/paul/Documents");
  });

  it("roundtrips folder ID parts", () => {
    const parts = {
      device: "macbook",
      user: "paul",
      path: "/Users/paul/Documents",
    };

    expect(parseFolderId(buildFolderId(parts))).toEqual(parts);
  });

  it("keeps separators that belong to the path", () => {
    expect(parseFolderId("paul@macbook:/Volumes/Photos:2026/@raw")).toEqual({
      device: "macbook",
      user: "paul",
      path: "/Volumes/Photos:2026/@raw",
    });
  });

  it("supports Windows-style paths", () => {
    expect(parseFolderId("paul@desktop:C:\\Users\\paul\\Documents")).toEqual({
      device: "desktop",
      user: "paul",
      path: "C:\\Users\\paul\\Documents",
    });
  });

  it("allows empty devices to match Kopia explicit source parsing", () => {
    expect(parseFolderId("paul@:/Users/paul/Documents")).toEqual({
      device: "",
      user: "paul",
      path: "/Users/paul/Documents",
    });
  });

  it("rejects values that are not explicit folder source IDs", () => {
    expect(parseFolderId("")).toBeNull();
    expect(parseFolderId("(global)")).toBeNull();
    expect(parseFolderId("/Users/paul/Documents")).toBeNull();
    expect(parseFolderId("paul@macbook")).toBeNull();
    expect(parseFolderId("@macbook:/Users/paul/Documents")).toBeNull();
    expect(parseFolderId("paul@macbook:")).toBeNull();
    expect(parseFolderId("paul:/Users/paul/Documents@macbook")).toBeNull();
  });
});
