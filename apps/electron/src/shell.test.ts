vi.mock("electron", () => ({
  shell: { openExternal: vi.fn() },
}));

import { shell } from "electron";
import { openBrowser } from "@electron/shell";

describe("openBrowser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens http URLs", () => {
    openBrowser("http://example.com");
    expect(shell.openExternal).toHaveBeenCalledWith("http://example.com/");
  });

  it("opens https URLs", () => {
    openBrowser("https://example.com/path");
    expect(shell.openExternal).toHaveBeenCalledWith(
      "https://example.com/path",
    );
  });

  it("opens mailto URLs", () => {
    openBrowser("mailto:test@example.com");
    expect(shell.openExternal).toHaveBeenCalledWith(
      "mailto:test@example.com",
    );
  });

  it("does not open file: URLs", () => {
    const result = openBrowser("file:///etc/passwd");
    expect(result).toBeUndefined();
    expect(shell.openExternal).not.toHaveBeenCalled();
  });

  it("does not open javascript: URLs", () => {
    const result = openBrowser("javascript:alert(1)");
    expect(result).toBeUndefined();
    expect(shell.openExternal).not.toHaveBeenCalled();
  });

  it("throws on malformed URLs", () => {
    expect(() => openBrowser("not-a-url")).toThrow();
  });
});
