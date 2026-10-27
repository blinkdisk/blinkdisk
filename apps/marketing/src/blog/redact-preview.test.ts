import { redactPreviewRequest } from "@marketing/blog/redact-preview";
import { describe, expect, it } from "vitest";

describe("preview diagnostics", () => {
  it("removes preview credentials from every request field Sentry stores", () => {
    const event = {
      request: {
        url: "https://blinkdisk.com/blog/preview/id?key=private-key&version=draft",
        query_string: "key=private-key",
        cookies: { "blog-preview": "private-cookie" },
        headers: {
          Cookie: "blog-preview=private-cookie",
          Authorization: "Bearer private-token",
          Referer: "https://blinkdisk.com/blog/preview/id?key=private-key",
          Accept: "text/html",
        },
      },
    };
    const result = redactPreviewRequest(event);
    expect(JSON.stringify(result)).not.toContain("private-");
    expect(result.request.url).toBe(
      "https://blinkdisk.com/blog/preview/id?version=draft",
    );
    expect(result.request.headers).toEqual({ Accept: "text/html" });
  });
});
