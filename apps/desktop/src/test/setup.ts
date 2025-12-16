import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.electron if needed
global.window = global.window || {};
(global.window as any).electron = {
  fs: {
    folderSize: vi.fn(),
  },
};

// Mock folderMockPolicy if needed
(global.window as any).folderMockPolicy = {};