import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

const source = readFileSync(
  new URL("../../pages/download.astro", import.meta.url),
  "utf8",
);
const script = source.match(/<script is:inline[^>]*>([\s\S]*?)<\/script>/)?.[1];
if (!script) throw new Error("Missing download tracking script");

function track(search: string, session: string | null, blockedStorage = false) {
  const handlers = new Map<string, (event: unknown) => void>();
  const capture = vi.fn();
  const page = {
    dataset: {},
    addEventListener: (name: string, callback: (event: unknown) => void) =>
      handlers.set(name, callback),
  };
  runInNewContext(script as string, {
    document: { currentScript: { parentElement: page } },
    window: { location: { search }, posthog: { capture } },
    URLSearchParams,
    sessionStorage: {
      getItem: () => {
        if (blockedStorage) throw new Error("Storage blocked");
        return session;
      },
    },
    localStorage: { getItem: () => "true" },
    dev: true,
    console: { info: vi.fn() },
  });
  const download = () =>
    handlers.get("download-started")?.({
      detail: { file: "installer.exe", properties: { platform: "windows" } },
    });
  download();
  download();
  return capture;
}

describe("download attribution", () => {
  it("attributes downloads using the explicit calculator even for returning downloaders", () => {
    const capture = track("?calculator=backup", "s3");
    expect(capture).toHaveBeenCalledExactlyOnceWith("download_started", {
      file: "installer.exe",
      platform: "windows",
      storage_calculator: "backup",
    });
  });
  it("attributes navigation through the regular download button using the session fallback", () => {
    expect(track("", "s3")).toHaveBeenCalledWith(
      "download_started",
      expect.objectContaining({ storage_calculator: "s3" }),
    );
  });
  it("does not add invalid source values or fail when session storage is unavailable", () => {
    for (const capture of [
      track("?calculator=arbitrary", "arbitrary"),
      track("", null, true),
    ]) {
      expect(capture).toHaveBeenCalledWith("download_started", {
        file: "installer.exe",
        platform: "windows",
      });
    }
  });
});
