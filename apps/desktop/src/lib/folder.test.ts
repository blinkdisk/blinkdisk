import { hashFolder } from "@desktop/lib/folder";

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
