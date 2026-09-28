import {
  CoreError,
  extractErrorMessage,
  mapCoreErrorCode,
  VAULT_REQUEST_TIMEOUT_MARKER,
  VAULT_SERVER_UNAVAILABLE_MARKER,
} from "./error";

describe("extractErrorMessage", () => {
  it("reads a plain string", () => {
    expect(extractErrorMessage("boom")).toBe("boom");
  });

  it("reads an Error message", () => {
    expect(extractErrorMessage(new Error("boom"))).toBe("boom");
  });

  it("reads the error field of an object", () => {
    expect(extractErrorMessage({ error: "boom" })).toBe("boom");
  });

  it("reads the message field of an object", () => {
    expect(extractErrorMessage({ message: "boom" })).toBe("boom");
  });

  it("returns an empty string for nullish input", () => {
    expect(extractErrorMessage(undefined)).toBe("");
    expect(extractErrorMessage(null)).toBe("");
  });
});

describe("mapCoreErrorCode", () => {
  it("maps an unreachable storage path", () => {
    expect(
      mapCoreErrorCode({
        error:
          "internal server error: cannot access storage path: GetFileAttributesEx \\\\Fun\\data: not found",
      }),
    ).toBe("STORAGE_UNREACHABLE");
  });

  it("maps common network failures", () => {
    expect(mapCoreErrorCode("dial tcp: connection refused")).toBe(
      "STORAGE_UNREACHABLE",
    );
    expect(mapCoreErrorCode("ssh: handshake failed")).toBe(
      "STORAGE_UNREACHABLE",
    );
    expect(mapCoreErrorCode("lookup host: no such host")).toBe(
      "STORAGE_UNREACHABLE",
    );
  });

  it("maps a request timeout marker", () => {
    expect(
      mapCoreErrorCode(`${VAULT_REQUEST_TIMEOUT_MARKER}: no response`),
    ).toBe("STORAGE_UNREACHABLE");
  });

  it("maps a server unavailable marker even when wrapped by IPC", () => {
    const wrapped = new Error(
      `Error invoking remote method 'vault.create': CoreError: ${VAULT_SERVER_UNAVAILABLE_MARKER}: did not start`,
    );
    expect(mapCoreErrorCode(wrapped)).toBe("VAULT_SERVER_UNAVAILABLE");
  });

  it("maps a CoreError with a marker message", () => {
    const error = new CoreError({
      code: "VAULT_SERVER_UNAVAILABLE",
      message: `${VAULT_SERVER_UNAVAILABLE_MARKER}: stopped early`,
    });
    expect(mapCoreErrorCode(error)).toBe("VAULT_SERVER_UNAVAILABLE");
  });

  it("returns undefined for an unrelated error", () => {
    expect(mapCoreErrorCode("something else went wrong")).toBeUndefined();
    expect(mapCoreErrorCode(undefined)).toBeUndefined();
  });
});
