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

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("window", { electron: { auth: { open: mocks.open } } });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it("handles browser-open failures and closes the sign-in dialog", async () => {
  const error = new Error("No default browser");
  const logError = vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.open.mockRejectedValueOnce(error);

  useAuthDialog().openAuthDialog();

  await vi.waitFor(() => {
    expect(useAuthDialog().isOpen).toBe(false);
    expect(mocks.showErrorToast).toHaveBeenCalledWith(
      expect.objectContaining({ code: "AUTH_OPEN_FAILED" }),
    );
    expect(logError).toHaveBeenCalledWith(
      "Failed to open sign-in browser",
      error,
    );
  });
});

it("ignores a stale launch failure after a later retry", async () => {
  let rejectFirst: (error: Error) => void = () => {};
  const first = new Promise<void>((_, reject) => {
    rejectFirst = reject;
  });
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.open.mockReturnValueOnce(first).mockResolvedValueOnce(undefined);

  useAuthDialog().openAuthDialog();
  useAuthDialog().openAuthDialog();
  rejectFirst(new Error("Earlier launch failed"));
  await first.catch(() => undefined);

  expect(useAuthDialog().isOpen).toBe(true);
  expect(mocks.showErrorToast).not.toHaveBeenCalled();
});
