import { buildFolderId, hashFolder, parseFolderId } from "@desktop/lib/folder";

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

describe("hashFolder", () => {
  it("returns a 40-character hex string", async () => {
    const result = await hashFolder({
      hostName: "myhost",
      userName: "user",
      path: "/home/user/docs",
    });
    expect(result).toHaveLength(40);
  });

  it("all characters are valid hex", async () => {
    const result = await hashFolder({
      hostName: "myhost",
      userName: "user",
      path: "/home/user/docs",
    });
    expect(result).toMatch(/^[0-9a-f]{40}$/);
  });

  it("same inputs produce the same hash (deterministic)", async () => {
    const input = {
      hostName: "myhost",
      userName: "user",
      path: "/home/user/docs",
    };
    const first = await hashFolder(input);
    const second = await hashFolder(input);
    expect(first).toBe(second);
  });

  it("different inputs produce different hashes", async () => {
    const hash1 = await hashFolder({
      hostName: "host1",
      userName: "user",
      path: "/path",
    });
    const hash2 = await hashFolder({
      hostName: "host2",
      userName: "user",
      path: "/path",
    });
    const hash3 = await hashFolder({
      hostName: "host1",
      userName: "other",
      path: "/path",
    });
    expect(hash1).not.toBe(hash2);
    expect(hash1).not.toBe(hash3);
    expect(hash2).not.toBe(hash3);
  });
});
