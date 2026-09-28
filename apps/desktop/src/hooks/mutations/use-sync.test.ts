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

it("shows a translated sync error and captures a handled manual failure", () => {
  useSync();
  const options = mocks.useMutation.mock.calls[0]?.[0] as {
    onError: (error: Error) => void;
  };

  options.onError(
    new Error("Error invoking remote method 'sync.account': TRPCClientError"),
  );

  expect(mocks.capture).toHaveBeenCalledWith("account_sync_failed", {
    source: "manual",
    reason: "ACCOUNT_SYNC_FAILED",
  });
  expect(mocks.showErrorToast).toHaveBeenCalledWith({
    code: "ACCOUNT_SYNC_FAILED",
  });
});
