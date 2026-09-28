import { useAuthDialog } from "@desktop/hooks/state/use-auth-dialog";
import { afterEach, describe, expect, it, vi } from "vitest";

const capture = vi.hoisted(() => vi.fn());

vi.mock("posthog-js/react", () => ({
  usePostHog: () => ({ capture }),
}));

vi.mock("@tanstack/react-store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-store")>();
  return {
    ...actual,
    useStore: (store: { state: unknown }) => store.state,
  };
});

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useCallback: (callback: unknown) => callback,
  };
});

describe("useAuthDialog", () => {
  afterEach(() => {
    useAuthDialog().setIsOpen(false);
    vi.unstubAllGlobals();
    capture.mockClear();
    vi.restoreAllMocks();
  });

  it("shows a browser launch failure and clears it when retrying", async () => {
    const error = new Error("No browser is registered");
    const logError = vi.spyOn(console, "error").mockImplementation(() => {});
    const open = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(undefined);
    vi.stubGlobal("window", { electron: { auth: { open } } });

    await useAuthDialog().openAuthDialog();
    expect(useAuthDialog()).toMatchObject({
      isOpen: true,
      browserFailed: true,
    });
    expect(capture).toHaveBeenCalledWith("auth_open_failed");
    expect(logError).toHaveBeenCalledWith(
      "Failed to open sign-in browser",
      error,
    );

    await useAuthDialog().openAuthDialog();
    expect(useAuthDialog()).toMatchObject({
      isOpen: true,
      browserFailed: false,
    });
    expect(open).toHaveBeenCalledTimes(2);
  });

  it("ignores a stale launch failure after a later retry", async () => {
    let rejectFirst: (error: Error) => void = () => {};
    const first = new Promise<void>((_, reject) => {
      rejectFirst = reject;
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const open = vi
      .fn()
      .mockReturnValueOnce(first)
      .mockResolvedValueOnce(undefined);
    vi.stubGlobal("window", { electron: { auth: { open } } });

    const firstAttempt = useAuthDialog().openAuthDialog();
    await useAuthDialog().openAuthDialog();
    rejectFirst(new Error("Earlier launch failed"));
    await firstAttempt;

    expect(useAuthDialog()).toMatchObject({
      isOpen: true,
      browserFailed: false,
    });
    expect(capture).toHaveBeenCalledWith("auth_open_failed");
  });
});
