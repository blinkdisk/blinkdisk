const mockStore = vi.hoisted(() => ({ get: vi.fn() }));
const mockNativeTheme = vi.hoisted(() => ({ shouldUseDarkColors: false }));

vi.mock("@electron/store", () => ({
  store: mockStore,
}));

vi.mock("electron/main", () => ({
  nativeTheme: mockNativeTheme,
}));

import { getTheme } from "@electron/theme";

describe("getTheme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNativeTheme.shouldUseDarkColors = false;
  });

  it("returns dark when preference is dark", () => {
    mockStore.get.mockReturnValue("dark");
    expect(getTheme()).toBe("dark");
  });

  it("returns light when preference is light", () => {
    mockStore.get.mockReturnValue("light");
    expect(getTheme()).toBe("light");
  });

  it("returns dark when preference is system and system is dark", () => {
    mockStore.get.mockReturnValue("system");
    mockNativeTheme.shouldUseDarkColors = true;
    expect(getTheme()).toBe("dark");
  });

  it("returns light when preference is system and system is light", () => {
    mockStore.get.mockReturnValue("system");
    mockNativeTheme.shouldUseDarkColors = false;
    expect(getTheme()).toBe("light");
  });

  it("returns system theme when preference is undefined", () => {
    mockStore.get.mockReturnValue(undefined);
    mockNativeTheme.shouldUseDarkColors = true;
    expect(getTheme()).toBe("dark");
  });

  it("returns system theme when preference is null", () => {
    mockStore.get.mockReturnValue(null);
    mockNativeTheme.shouldUseDarkColors = false;
    expect(getTheme()).toBe("light");
  });
});
