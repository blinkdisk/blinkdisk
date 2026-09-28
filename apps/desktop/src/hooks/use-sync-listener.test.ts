const mocks = vi.hoisted(() => ({
  accountId: "acct_1",
  capture: vi.fn(),
  sync: vi.fn(),
}));

vi.mock("@desktop/hooks/use-account-id", () => ({
  useAccountId: () => ({ accountId: mocks.accountId }),
}));

vi.mock("posthog-js/react", () => ({
  usePostHog: () => ({ capture: mocks.capture }),
}));

vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useEffect: (callback: () => void) => callback(),
}));

import { useSyncListener } from "@desktop/hooks/use-sync-listener";

describe("useSyncListener", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("window", { electron: { sync: { account: mocks.sync } } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("handles background sync failures and captures a separate failure event", async () => {
    mocks.sync.mockRejectedValueOnce(
      new Error(
        "Error invoking remote method 'sync.account': Error: ACCOUNT_SYNC_FAILED",
      ),
    );

    useSyncListener();
    await vi.waitFor(() => {
      expect(mocks.capture).toHaveBeenCalledWith("account_sync_failed", {
        source: "background",
        reason: "ACCOUNT_SYNC_FAILED",
      });
    });
  });
});
