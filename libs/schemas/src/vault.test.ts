import { LATEST_VAULT_VERSION } from "@blinkdisk/constants/vault";
import { ZVault, ZVaultOptions } from "@schemas/vault";

const validOptions = {
  version: 2,
  encryption: "AES256-GCM-HMAC-SHA256",
  hash: "BLAKE3-256",
  splitter: "DYNAMIC-4M-BUZHASH",
  errorCorrectionAlgorithm: "REED-SOLOMON-CRC32",
  errorCorrectionOverhead: 10,
} as const;

describe("vault schemas", () => {
  it("accepts supported vault options", () => {
    expect(ZVaultOptions.safeParse(validOptions).success).toBe(true);
  });

  it("rejects unsupported vault option versions and ECC overhead", () => {
    expect(
      ZVaultOptions.safeParse({ ...validOptions, version: 1 }).success,
    ).toBe(false);
    expect(
      ZVaultOptions.safeParse({
        ...validOptions,
        errorCorrectionOverhead: 101,
      }).success,
    ).toBe(false);
  });

  it("enforces vault version bounds and valid dates", () => {
    expect(
      ZVault.safeParse({
        id: "vlt_test",
        coreId: "core",
        status: "ACTIVE",
        name: "Backups",
        version: LATEST_VAULT_VERSION,
        provider: "CLOUDBLINK",
        configLevel: "VAULT",
        options: validOptions,
        createdAt: new Date().toISOString(),
      }).success,
    ).toBe(true);

    expect(
      ZVault.safeParse({
        id: "vlt_test",
        coreId: "core",
        status: "ACTIVE",
        name: "Backups",
        version: LATEST_VAULT_VERSION + 1,
        provider: "CLOUDBLINK",
        configLevel: "VAULT",
        options: validOptions,
        createdAt: "today",
      }).success,
    ).toBe(false);
  });
});
