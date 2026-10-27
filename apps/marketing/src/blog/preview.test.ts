import { createHmac } from "node:crypto";
import {
  previewSession,
  validPreviewKey,
  validPreviewSession,
} from "@marketing/blog/preview";
import { describe, expect, it } from "vitest";

describe("private preview", () => {
  it("accepts only the configured preview key", async () => {
    const linkKey = createHmac("sha256", "secret")
      .update("blinkdisk:blog-preview:link:v1")
      .digest("hex");
    expect(await validPreviewKey(linkKey, "secret")).toBe(true);
    expect(await validPreviewKey("secret", "secret")).toBe(false);
    expect(await validPreviewKey(linkKey, "wrong")).toBe(false);
    expect(await validPreviewKey(`${linkKey}\0`, "secret")).toBe(false);
    expect(
      await validPreviewSession(await previewSession(linkKey), "secret"),
    ).toBe(false);
    expect(await validPreviewKey("", "")).toBe(false);
  });
  it("signs one-hour sessions and rejects tampering, expiration, and future cookies", async () => {
    const now = 1_800_000_000_000;
    const token = await previewSession("secret", now);
    expect(await validPreviewSession(`${token}.extra`, "secret", now)).toBe(
      false,
    );
    expect(await validPreviewSession(token, "secret", now)).toBe(true);
    const [expires, signature] = token.split(".");
    expect(
      await validPreviewSession(
        `${Number(expires) + 60}.${signature}`,
        "secret",
        now + 60_000,
      ),
    ).toBe(false);
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
