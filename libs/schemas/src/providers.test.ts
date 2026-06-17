import {
  ZAmazonS3Config,
  ZFilesystemConfig,
  ZProviderType,
  ZS3CompatibleConfig,
  ZSftpConfig,
  ZWebDavConfig,
} from "@schemas/providers";

describe("provider schemas", () => {
  it("accepts supported provider types and rejects unknown values", () => {
    expect(ZProviderType.safeParse("CLOUDBLINK").success).toBe(true);
    expect(ZProviderType.safeParse("DROPBOX").success).toBe(false);
  });

  it("enforces required filesystem path", () => {
    expect(ZFilesystemConfig.safeParse({ path: "/data" }).success).toBe(true);
    expect(ZFilesystemConfig.safeParse({ path: "" }).success).toBe(false);
  });

  it("requires Amazon S3 region and base credentials", () => {
    expect(
      ZAmazonS3Config.safeParse({
        endpoint: "https://s3.amazonaws.com",
        bucket: "bucket",
        accessKeyId: "key",
        region: "eu-central-1",
      }).success,
    ).toBe(true);

    expect(
      ZAmazonS3Config.safeParse({
        endpoint: "https://s3.amazonaws.com",
        bucket: "bucket",
        accessKeyId: "key",
      }).success,
    ).toBe(false);
  });

  it("requires explicit S3-compatible TLS flags", () => {
    expect(
      ZS3CompatibleConfig.safeParse({
        endpoint: "https://example.com",
        bucket: "bucket",
        accessKeyId: "key",
        disableTls: false,
        disableTlsVerification: false,
      }).success,
    ).toBe(true);

    expect(
      ZS3CompatibleConfig.safeParse({
        endpoint: "https://example.com",
        bucket: "bucket",
        accessKeyId: "key",
      }).success,
    ).toBe(false);
  });

  it("checks SFTP port and known-hosts requirements", () => {
    expect(
      ZSftpConfig.safeParse({
        host: "example.com",
        user: "backup",
        port: 22,
        path: "/backups",
        knownHosts: "example.com ssh-ed25519 key",
      }).success,
    ).toBe(true);

    expect(
      ZSftpConfig.safeParse({
        host: "example.com",
        user: "backup",
        port: 70000,
        path: "/backups",
        knownHosts: "example.com ssh-ed25519 key",
      }).success,
    ).toBe(false);
  });

  it("requires a valid WebDAV URL", () => {
    expect(
      ZWebDavConfig.safeParse({ url: "https://example.com/dav" }).success,
    ).toBe(true);
    expect(ZWebDavConfig.safeParse({ url: "not-a-url" }).success).toBe(false);
  });
});
