import { describe, expect, it, vi } from "vitest";

const create = vi.hoisted(() => vi.fn());
vi.mock("shiki/core", () => ({ createHighlighterCore: create }));

import { highlight } from "@marketing/blog/highlight";

describe("code highlighting recovery", () => {
  it("retries initialization after a transient failure instead of retaining a rejected promise", async () => {
    create
      .mockRejectedValueOnce(new Error("initialization failed"))
      .mockResolvedValue({
        getLoadedLanguages: () => ["javascript"],
        codeToHtml: () => "<pre>recovered</pre>",
      });
    await expect(highlight("code", "js")).rejects.toThrow(
      "initialization failed",
    );
    expect(await highlight("code", "js")).toBe("<pre>recovered</pre>");
    expect(create).toHaveBeenCalledTimes(2);
  });
});
