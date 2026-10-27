import { parseEnv } from "node:util";
import { describe, expect, it } from "vitest";
import {
  mediaExtension,
  previewLinkKey,
  resolveCmsUrl,
  serializeEnvironment,
  setupPreviewSecret,
} from "./config.mjs";

const stored = "stored-secret-".repeat(4);
const configured = "configured-secret-".repeat(4);
describe("Directus setup configuration", () => {
  it("accepts origin URLs and rejects path prefixes and embedded credentials", () => {
    expect(resolveCmsUrl("https://cms.example.com/")).toBe(
      "https://cms.example.com",
    );
    expect(resolveCmsUrl("http://localhost:8055")).toBe(
      "http://localhost:8055",
    );
    for (const url of [
      "https://cms.example.com/directus",
      "https://user:pass@cms.example.com",
      "https://cms.example.com?key=x",
      "http://cms.example.com",
      "ftp://localhost",
    ])
      expect(() => resolveCmsUrl(url)).toThrow();
  });
  it("preserves secrets, falls back from empty settings, and refuses silent rotation", () => {
    expect(setupPreviewSecret("", stored, "https://site.example/preview")).toBe(
      stored,
    );
    expect(
      setupPreviewSecret(configured, stored, "https://site.example/preview"),
    ).toBe(configured);
    expect(() =>
      setupPreviewSecret("", "", "https://site.example/preview"),
    ).toThrow("will not silently rotate");
    expect(setupPreviewSecret("", "", null)).toMatch(/^[a-f0-9]{64}$/);
    expect(previewLinkKey(stored)).toMatch(/^[a-f0-9]{64}$/);
    expect(previewLinkKey(stored)).not.toBe(previewLinkKey(configured));
    expect(() => setupPreviewSecret("short", stored, null)).toThrow(
      "at least 32 characters",
    );
    expect(() => setupPreviewSecret("", "short", null)).toThrow(
      "at least 32 characters",
    );
  });
  it("round-trips supported environment values and rejects corrupting input", () => {
    const values = {
      DIRECTUS_URL: "https://cms.example.com",
      BLOG_PREVIEW_SECRET: "a # b = c '$ value",
    };
    expect(parseEnv(serializeEnvironment(values))).toEqual(values);
    for (const value of [
      'quote"value',
      "back\\slash",
      "new\nline",
      "null\0byte",
    ])
      expect(() =>
        serializeEnvironment({ BLOG_PREVIEW_SECRET: value }),
      ).toThrow("Unsupported environment value");
  });
  it("uses matching image extensions and rejects non-image downloads", () => {
    for (const [mime, extension] of [
      ["image/png", ".png"],
      ["image/jpeg", ".jpg"],
      ["IMAGE/JPEG", ".jpg"],
      [" Image/PNG ; charset=binary", ".png"],
      ["image/gif", ".gif"],
      ["image/avif", ".avif"],
      ["image/webp", ".webp"],
    ])
      expect(mediaExtension(mime)).toBe(extension);
    for (const mime of [
      "text/html",
      "image/svg+xml",
      "application/octet-stream",
      "",
    ])
      expect(() => mediaExtension(mime)).toThrow();
  });
});
