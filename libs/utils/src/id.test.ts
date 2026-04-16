import { generateId, generateCode, verifyId, type Prefix } from "./id";

describe("generateId", () => {
  it("returns a string of length 21 without prefix", () => {
    const id = generateId();
    expect(id).toHaveLength(21);
  });

  it("generates a valid id that passes verification", () => {
    const id = generateId();
    expect(verifyId(id)).toBe(true);
  });

  it("prefixes with 'acct_' for Account", () => {
    const id = generateId("Account");
    expect(id).toMatch(/^acct_/);
  });

  it("prefixes with 'vlt_' for Vault", () => {
    const id = generateId("Vault");
    expect(id).toMatch(/^vlt_/);
  });

  it("produces correct prefix for every prefix key", () => {
    const expectedPrefixes: Record<Prefix, string> = {
      Account: "acct",
      AuthMethod: "auth",
      Session: "sesh",
      Verification: "ver",
      Queue: "que",
      Device: "dev",
      Profile: "prf",
      Vault: "vlt",
      Config: "cfg",
      Folder: "fld",
      Space: "spc",
      Subscription: "sub",
    };

    for (const [key, prefix] of Object.entries(expectedPrefixes)) {
      const id = generateId(key as Prefix);
      expect(id).toMatch(new RegExp(`^${prefix}_`));
    }
  });

  it("generates unique ids", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});

describe("verifyId", () => {
  it("returns true for a valid unprefixed id", () => {
    const id = generateId();
    expect(verifyId(id)).toBe(true);
  });

  it("returns true for a valid prefixed id", () => {
    const id = generateId("Vault");
    expect(verifyId(id)).toBe(true);
  });

  it("returns false for an invalid id", () => {
    expect(verifyId("totally-invalid-id!!")).toBe(false);
  });

  it("returns false for wrong length", () => {
    expect(verifyId("short")).toBe(false);
  });
});

describe("generateCode", () => {
  it("returns a string of default length 21", () => {
    const code = generateCode();
    expect(code).toHaveLength(21);
  });

  it("returns a string of specified length", () => {
    const code = generateCode(10);
    expect(code).toHaveLength(10);
  });

  it("only contains expected characters (A-Z except O, 1-9)", () => {
    const code = generateCode(100);
    expect(code).toMatch(/^[ABCDEFGHIJKLMNPQRSTUVWXYZ123456789]+$/);
  });
});
