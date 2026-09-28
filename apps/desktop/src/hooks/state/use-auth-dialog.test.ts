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
  });

  it("shows a browser launch failure and clears it when retrying", async () => {
    const open = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error("No browser is registered"))
      .mockResolvedValueOnce(undefined);
    vi.stubGlobal("window", { electron: { auth: { open } } });

    await useAuthDialog().openAuthDialog();
    expect(useAuthDialog()).toMatchObject({
      isOpen: true,
      browserFailed: true,
    });
    expect(capture).toHaveBeenCalledWith("auth_open_failed");

    await useAuthDialog().openAuthDialog();
    expect(useAuthDialog()).toMatchObject({
      isOpen: true,
      browserFailed: false,
    });
    expect(open).toHaveBeenCalledTimes(2);
  });
});
