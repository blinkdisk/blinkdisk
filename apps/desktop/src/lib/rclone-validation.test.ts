import { getMissingRcloneRemote } from "@desktop/lib/rclone-validation";
import { describe, expect, it } from "vitest";

describe("getMissingRcloneRemote", () => {
  it("identifies a missing configured remote from a nested path", () => {
    expect(
      getMissingRcloneRemote(
        "Failed to create file system for 'photos:backup': didn't find section in config file",
        "photos:backup",
      ),
    ).toBe("photos");
  });

  it("leaves unrelated rclone errors unchanged", () => {
    expect(
      getMissingRcloneRemote("permission denied", "photos:backup"),
    ).toBeUndefined();
  });

  it("does not name a remote when the path has no remote name", () => {
    expect(
      getMissingRcloneRemote("didn't find section in config file", ":backup"),
    ).toBeUndefined();
  });
});
