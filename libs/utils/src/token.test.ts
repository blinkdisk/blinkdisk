import { getVaultId } from "./token";

function createFakeJwt(payload: Record<string, unknown>) {
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

describe("getVaultId", () => {
  it("returns null when no Authorization header", () => {
    const headers = new Headers();
    expect(getVaultId(headers)).toBeNull();
  });

  it("returns null when token payload has no vault or storage id", () => {
    const token = createFakeJwt({});
    const headers = new Headers({
      Authorization: `Bearer ${token}`,
    });
    expect(getVaultId(headers)).toBeNull();
  });

  it("throws when token is completely malformed", () => {
    const headers = new Headers({
      Authorization: "Bearer not-a-valid-jwt",
    });
    expect(() => getVaultId(headers)).toThrow();
  });

  it("returns vaultId from valid token", () => {
    const token = createFakeJwt({ vaultId: "vlt_abc123" });
    const headers = new Headers({ Authorization: `Bearer ${token}` });
    expect(getVaultId(headers)).toBe("vlt_abc123");
  });

  it("migrates legacy storageId with strg_ prefix to vlt_", () => {
    const token = createFakeJwt({ storageId: "strg_abc" });
    const headers = new Headers({ Authorization: `Bearer ${token}` });
    expect(getVaultId(headers)).toBe("vlt_abc");
  });

  it("falls back to storageId when vaultId is missing", () => {
    const token = createFakeJwt({ storageId: "vlt_fallback" });
    const headers = new Headers({ Authorization: `Bearer ${token}` });
    expect(getVaultId(headers)).toBe("vlt_fallback");
  });

  it("returns null when neither vaultId nor storageId present", () => {
    const token = createFakeJwt({ something: "else" });
    const headers = new Headers({ Authorization: `Bearer ${token}` });
    expect(getVaultId(headers)).toBeNull();
  });
});
