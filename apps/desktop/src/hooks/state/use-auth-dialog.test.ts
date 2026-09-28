const mocks = vi.hoisted(() => ({
  open: vi.fn(),
  showErrorToast: vi.fn(),
}));

vi.mock("@tanstack/react-store", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-store")>()),
  useStore: (store: { state: unknown }) => store.state,
}));

vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useCallback: (callback: (...args: never[]) => unknown) => callback,
}));

vi.mock("@blinkdisk/utils/error-toast", () => ({
  showErrorToast: (error: unknown) => mocks.showErrorToast(error),
}));

import { useAuthDialog } from "@desktop/hooks/state/use-auth-dialog";

it("handles browser-open failures and closes the sign-in dialog", async () => {
  vi.stubGlobal("window", { electron: { auth: { open: mocks.open } } });
  mocks.open.mockRejectedValueOnce(new Error("No default browser"));

  useAuthDialog().openAuthDialog();

  await vi.waitFor(() => {
    expect(useAuthDialog().isOpen).toBe(false);
    expect(mocks.showErrorToast).toHaveBeenCalledWith(
      expect.objectContaining({ code: "AUTH_OPEN_FAILED" }),
    );
  });
  vi.unstubAllGlobals();
});
