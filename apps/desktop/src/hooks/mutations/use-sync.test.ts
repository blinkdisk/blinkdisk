const mocks = vi.hoisted(() => ({
  capture: vi.fn(),
  showErrorToast: vi.fn(),
  useMutation: vi.fn((_options: unknown) => undefined),
}));

vi.mock("@blinkdisk/hooks/use-app-translation", () => ({
  useAppTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@desktop/hooks/use-account-id", () => ({
  useAccountId: () => ({ accountId: "acct_1" }),
}));

vi.mock("@blinkdisk/utils/error-toast", () => ({
  showErrorToast: (error: unknown) => mocks.showErrorToast(error),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: (options: unknown) => mocks.useMutation(options),
}));

vi.mock("posthog-js/react", () => ({
  usePostHog: () => ({ capture: mocks.capture }),
}));

import { useSync } from "@desktop/hooks/mutations/use-sync";

beforeEach(() => {
  vi.clearAllMocks();
});

it("captures an unknown manual failure and forwards a safe code to the toast", () => {
  useSync();
  const options = mocks.useMutation.mock.calls[0]?.[0] as {
    onError: (error: Error) => void;
  };

  options.onError(
    new Error("Error invoking remote method 'sync.account': TRPCClientError"),
  );

  expect(mocks.capture).toHaveBeenCalledWith("account_sync_failed", {
    source: "manual",
    reason: "UNKNOWN",
  });
  expect(mocks.showErrorToast).toHaveBeenCalledWith({
    code: "ACCOUNT_SYNC_FAILED",
  });
});

it("preserves a specific error code in the failure event and toast", () => {
  useSync();
  const options = mocks.useMutation.mock.calls[0]?.[0] as {
    onError: (error: Error) => void;
  };

  options.onError(
    Object.assign(new Error("Unauthorized"), { code: "UNAUTHORIZED" }),
  );

  expect(mocks.capture).toHaveBeenCalledWith("account_sync_failed", {
    source: "manual",
    reason: "UNAUTHORIZED",
  });
  expect(mocks.showErrorToast).toHaveBeenCalledWith({ code: "UNAUTHORIZED" });
});
