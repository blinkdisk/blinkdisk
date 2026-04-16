vi.mock("@blinkdisk/constants/app", () => ({
  APP_SCHEME: "blinkdisk",
  APP_SCHEME_PROTOCOL: "blinkdisk:",
}));

vi.mock("@electron/auth", () => ({
  authenticateToken: vi.fn(),
}));

vi.mock("@electron/window", () => ({
  focusWindow: vi.fn(),
  sendWindow: vi.fn(),
}));

vi.mock("electron", () => ({
  app: {
    setAsDefaultProtocolClient: vi.fn(() => true),
    on: vi.fn(),
  },
}));

import { authenticateToken } from "@electron/auth";
import { sendWindow } from "@electron/window";
import { onDeeplinkOpen } from "@electron/deeplink";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("onDeeplinkOpen", () => {
  it("ignores invalid/malformed URLs", async () => {
    await expect(onDeeplinkOpen("not-a-valid-url")).resolves.toBeUndefined();
    expect(sendWindow).not.toHaveBeenCalled();
    expect(authenticateToken).not.toHaveBeenCalled();
  });

  it("ignores URLs with wrong protocol", async () => {
    await onDeeplinkOpen("https://example.com");

    expect(sendWindow).not.toHaveBeenCalled();
    expect(authenticateToken).not.toHaveBeenCalled();
  });

  it("sends deeplink.onOpen event for valid protocol URL", async () => {
    await onDeeplinkOpen("blinkdisk://settings");

    expect(sendWindow).toHaveBeenCalledWith("deeplink.onOpen", { event: "settings" });
  });

  it("extracts and authenticates token from auth callback URL", async () => {
    await onDeeplinkOpen("blinkdisk://auth/callback#token=mytoken123");

    expect(sendWindow).toHaveBeenCalledWith("deeplink.onOpen", { event: "auth" });
    expect(authenticateToken).toHaveBeenCalledWith({ token: "mytoken123" });
  });

  it("does not authenticate when hash doesn't start with #token=", async () => {
    await onDeeplinkOpen("blinkdisk://auth/callback#other=value");

    expect(sendWindow).toHaveBeenCalledWith("deeplink.onOpen", { event: "auth" });
    expect(authenticateToken).not.toHaveBeenCalled();
  });

  it("does not authenticate for non-auth hostnames", async () => {
    await onDeeplinkOpen("blinkdisk://settings/callback#token=abc");

    expect(sendWindow).toHaveBeenCalledWith("deeplink.onOpen", { event: "settings" });
    expect(authenticateToken).not.toHaveBeenCalled();
  });

  it("does not authenticate for non-callback paths", async () => {
    await onDeeplinkOpen("blinkdisk://auth/other#token=abc");

    expect(sendWindow).toHaveBeenCalledWith("deeplink.onOpen", { event: "auth" });
    expect(authenticateToken).not.toHaveBeenCalled();
  });
});
