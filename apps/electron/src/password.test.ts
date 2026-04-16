const mockStore = vi.hoisted(() => ({ get: vi.fn(), set: vi.fn() }));

vi.mock("@electron/store", () => ({
  store: mockStore,
}));

vi.mock("@electron/encryption", () => ({
  encryptString: vi.fn((str: string) => `encrypted:${str}`),
  decryptString: vi.fn((str: string) => str.replace("encrypted:", "")),
}));

import { setPasswordCache, getPasswordCache } from "@electron/password";
import { encryptString, decryptString } from "@electron/encryption";

describe("setPasswordCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("encrypts the password and stores it with correct key", () => {
    setPasswordCache({ vaultId: "vault-1", password: "my-secret" });

    expect(encryptString).toHaveBeenCalledWith("my-secret");
    expect(mockStore.set).toHaveBeenCalledWith(
      "passwords.vault-1",
      "encrypted:my-secret",
    );
  });

  it("uses the vaultId in the store key", () => {
    setPasswordCache({ vaultId: "abc-123", password: "pw" });

    expect(mockStore.set).toHaveBeenCalledWith(
      "passwords.abc-123",
      expect.anything(),
    );
  });
});

describe("getPasswordCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when no password stored", () => {
    mockStore.get.mockReturnValue(null);
    expect(getPasswordCache({ vaultId: "vault-1" })).toBeNull();
  });

  it("returns null when store returns undefined", () => {
    mockStore.get.mockReturnValue(undefined);
    expect(getPasswordCache({ vaultId: "vault-1" })).toBeNull();
  });

  it("decrypts and returns password when stored", () => {
    mockStore.get.mockReturnValue("encrypted:my-secret");
    const result = getPasswordCache({ vaultId: "vault-1" });

    expect(decryptString).toHaveBeenCalledWith("encrypted:my-secret", null);
    expect(result).toBe("my-secret");
  });

  it("reads from the correct store key using vaultId", () => {
    mockStore.get.mockReturnValue(null);
    getPasswordCache({ vaultId: "xyz-789" });

    expect(mockStore.get).toHaveBeenCalledWith("passwords.xyz-789");
  });
});
