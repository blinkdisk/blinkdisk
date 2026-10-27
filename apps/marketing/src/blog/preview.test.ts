import {
  previewSession,
  validPreviewKey,
  validPreviewSession,
} from "@marketing/blog/preview";
import { describe, expect, it } from "vitest";

describe("private preview", () => {
  it("accepts only the configured preview key", async () => {
    expect(await validPreviewKey("secret", "secret")).toBe(true);
    expect(await validPreviewKey("wrong", "secret")).toBe(false);
    expect(await validPreviewKey("secret\0", "secret")).toBe(false);
    expect(await validPreviewKey("", "")).toBe(false);
  });
  it("signs one-hour sessions and rejects tampering, expiration, and future cookies", async () => {
    const now = 1_800_000_000_000;
    const token = await previewSession("secret", now);
    expect(await validPreviewSession(`${token}.extra`, "secret", now)).toBe(
      false,
    );
    expect(await validPreviewSession(token, "secret", now)).toBe(true);
    expect(await validPreviewSession(token, "wrong", now)).toBe(false);
    expect(await validPreviewSession(`${token}broken`, "secret", now)).toBe(
      false,
    );
    expect(await validPreviewSession(token, "secret", now + 3_600_000)).toBe(
      false,
    );
    expect(await validPreviewSession(token, "secret", now - 1_000_000)).toBe(
      false,
    );
  });
});
