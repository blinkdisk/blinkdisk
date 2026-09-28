const mocks = vi.hoisted(() => ({
  toastError: vi.fn(),
}));

vi.mock("@utils/i18n", () => ({
  i18n: {
    t: (key: string) =>
      ({
        "error:ACCOUNT_SYNC_FAILED.title": "Could not sync your account",
        "error:ACCOUNT_SYNC_FAILED.description": "Please try again.",
      })[key] ?? "",
  },
}));

vi.mock("sonner", () => ({
  toast: { error: mocks.toastError },
}));

import { showErrorToast } from "@utils/error-toast";

it("translates the code preserved in an Electron sync error", () => {
  showErrorToast(
    new Error(
      "Error invoking remote method 'sync.account': Error: ACCOUNT_SYNC_FAILED",
    ),
  );

  expect(mocks.toastError).toHaveBeenCalledWith("Could not sync your account", {
    description: "Please try again.",
  });
});
