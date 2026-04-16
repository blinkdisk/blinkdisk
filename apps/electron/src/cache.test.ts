const mockStore = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@electron/store", () => ({
  store: mockStore,
}));

import { getAccountCache } from "@electron/cache";

describe("getAccountCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when store has no accounts", () => {
    mockStore.get.mockReturnValue({});
    expect(getAccountCache()).toEqual([]);
  });

  it("returns empty array when store.get returns undefined", () => {
    mockStore.get.mockReturnValue(undefined);
    expect(getAccountCache()).toEqual([]);
  });

  it("filters out inactive accounts", () => {
    mockStore.get.mockReturnValue({
      "acc-1": { active: false, name: "Inactive" },
      "acc-2": { active: undefined, name: "Also Inactive" },
    });
    expect(getAccountCache()).toEqual([]);
  });

  it("includes only active accounts", () => {
    mockStore.get.mockReturnValue({
      "acc-1": { active: true, name: "Active" },
    });
    const result = getAccountCache();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: "acc-1", active: true, name: "Active" });
  });

  it("adds id field from object keys", () => {
    mockStore.get.mockReturnValue({
      "my-account-id": { active: true },
    });
    const result = getAccountCache();
    expect(result[0].id).toBe("my-account-id");
  });

  it("handles multiple accounts, some active some not", () => {
    mockStore.get.mockReturnValue({
      "acc-1": { active: true, name: "First" },
      "acc-2": { active: false, name: "Second" },
      "acc-3": { active: true, name: "Third" },
      "acc-4": { active: null, name: "Fourth" },
    });
    const result = getAccountCache();
    expect(result).toHaveLength(2);
    expect(result.map((a) => a.id)).toEqual(["acc-1", "acc-3"]);
  });
});
