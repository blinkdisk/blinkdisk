import { describe, expect, it, vi } from "vitest";
import { setupPreviewSecret } from "./config.mjs";

const state = vi.hoisted(() => ({ local: {}, persisted: false }));
vi.mock("./client.mjs", () => ({
  cmsUrl: "https://cms.example.com",
  local: state.local,
  api: async (_path, options = {}) => {
    if (options.method && options.method !== "GET") {
      expect(state.persisted).toBe(true);
      throw new Error("Simulated CMS write failure");
    }
    return [];
  },
  find: async () => null,
  query: () => "",
  saveLocal: (values) => {
    Object.assign(state.local, values);
    state.persisted = true;
  },
}));

describe("interrupted setup", () => {
  it("persists a generated secret before any CMS write and can reuse it on retry", async () => {
    vi.stubEnv("BLOG_PREVIEW_SECRET", "");
    try {
      await expect(import("./setup.mjs")).rejects.toThrow(
        "Simulated CMS write failure",
      );
      expect(state.local.BLOG_PREVIEW_SECRET).toMatch(/^[a-f0-9]{64}$/);
      expect(
        setupPreviewSecret(
          "",
          state.local.BLOG_PREVIEW_SECRET,
          "https://site.example/preview",
        ),
      ).toBe(state.local.BLOG_PREVIEW_SECRET);
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
