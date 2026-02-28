import { mapConfigFields, mapProviderType } from "./mapping";

describe("mapProviderType", () => {
  it("maps standard provider types to core types", () => {
    expect(mapProviderType("FILESYSTEM")).toBe("filesystem");
    expect(mapProviderType("NETWORK_ATTACHED_STORAGE")).toBe("filesystem");
    expect(mapProviderType("AMAZON_S3")).toBe("s3");
    expect(mapProviderType("S3_COMPATIBLE")).toBe("s3");
    expect(mapProviderType("GOOGLE_CLOUD_STORAGE")).toBe("gcs");
    expect(mapProviderType("BACKBLAZE")).toBe("b2");
    expect(mapProviderType("AZURE_BLOB_STORAGE")).toBe("azureBlob");
    expect(mapProviderType("SFTP")).toBe("sftp");
    expect(mapProviderType("RCLONE")).toBe("rclone");
    expect(mapProviderType("WEBDAV")).toBe("webdav");
    expect(mapProviderType("CLOUDBLINK")).toBe("bdc");
  });

  it("resolves aliases", () => {
    expect(mapProviderType("BLINKDISK_CLOUD" as any)).toBe("bdc");
    expect(mapProviderType("BLINKCLOUD" as any)).toBe("bdc");
  });

  it("throws for unknown provider", () => {
    expect(() => mapProviderType("UNKNOWN" as any)).toThrow(
      "Provider UNKNOWN not found",
    );
  });
});

describe("mapConfigFields", () => {
  it("returns CloudBlink config with url, token, version", () => {
    const result = mapConfigFields(
      "CLOUDBLINK",
      { someField: "ignored" },
      3,
      "test-token",
    );

    expect(result).toEqual({
      url: process.env.CLOUD_URL,
      token: "test-token",
      version: 3,
    });
  });

  it("maps S3 fields using coreMapping", () => {
    const result = mapConfigFields("AMAZON_S3", {
      accessKeyType: "AKIA123",
      accessKeySecret: "secret",
      bucket: "my-bucket",
      region: "us-east-1",
      disableTls: true,
      disableSsl: false,
    });

    expect(result).toEqual({
      accessKeyID: "AKIA123",
      secretAccessKey: "secret",
      bucket: "my-bucket",
      region: "us-east-1",
      doNotUseTLS: true,
      doNotVerifySSL: false,
    });
  });

  it("passes through fields without mapping", () => {
    const result = mapConfigFields("GOOGLE_CLOUD_STORAGE", {
      bucket: "my-bucket",
      credentials: "creds",
    });

    expect(result).toEqual({
      bucket: "my-bucket",
      credentials: "creds",
    });
  });

  it("maps Azure fields", () => {
    const result = mapConfigFields("AZURE_BLOB_STORAGE", {
      account: "myaccount",
      key: "mykey",
      domain: "blob.core.windows.net",
      container: "backups",
    });

    expect(result).toEqual({
      storageAccount: "myaccount",
      storageKey: "mykey",
      storageDomain: "blob.core.windows.net",
      container: "backups",
    });
  });

  it("maps Backblaze fields", () => {
    const result = mapConfigFields("BACKBLAZE", {
      keyId: "key123",
      keySecret: "secret",
      bucket: "my-bucket",
    });

    expect(result).toEqual({
      keyId: "key123",
      key: "secret",
      bucket: "my-bucket",
    });
  });

  it("maps SFTP fields", () => {
    const result = mapConfigFields("SFTP", {
      host: "example.com",
      user: "admin",
      privateKey: "ssh-rsa ...",
      knownHosts: "example.com ssh-rsa ...",
      path: "/backups",
    });

    expect(result).toEqual({
      host: "example.com",
      username: "admin",
      keyData: "ssh-rsa ...",
      knownHostsData: "example.com ssh-rsa ...",
      path: "/backups",
    });
  });

  it("throws for unknown provider", () => {
    expect(() => mapConfigFields("UNKNOWN" as any, {})).toThrow(
      "Provider UNKNOWN not found",
    );
  });
});
