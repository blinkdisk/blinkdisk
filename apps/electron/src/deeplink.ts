import { APP_SCHEME, APP_SCHEME_PROTOCOL } from "@blinkdisk/config/app";
import { authenticateToken } from "@electron/auth";
import { focusWindow, sendWindow } from "@electron/window";
import { app } from "electron";
import { resolve } from "path";

let hasRegistered = false;
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    hasRegistered = app.setAsDefaultProtocolClient(
      APP_SCHEME,
      process.execPath,
      [resolve(process.argv[1] as string)],
    );
  }
} else {
  hasRegistered = app.setAsDefaultProtocolClient(APP_SCHEME);
}

if (!hasRegistered)
  console.warn(`Failed to register ${APP_SCHEME} as default protocol client`);

export async function onDeeplinkOpen(rawUrl: string) {
  let url: URL | null = null;
  try {
    url = new URL(rawUrl);
  } catch {
    // Not a url, ignore
  }

  if (!url) return;

  if (url.protocol !== APP_SCHEME_PROTOCOL) return;

  sendWindow("deeplink.onOpen", {
    event: url.host,
  });

  if (url.hostname === "auth") {
    if (url.pathname === "/callback") {
      if (!url.hash.startsWith("#token=")) return;
      const token = url.hash.substring("#token=".length);

      await authenticateToken({
        token,
      });
    }
  }
}

app.on("open-url", (_, url) => {
  focusWindow();

  // This event should only be triggered on MacOS
  if (process?.platform !== "darwin") return;

  onDeeplinkOpen(url);
});

export function checkDeepLink() {
  if (process?.platform === "darwin" || typeof process.argv[1] !== "string")
    return;

  let url: string | null = null;
  try {
    url = new URL(process.argv[1]).toString();
  } catch {
    // Not a url, ignore
  }

  if (!url) return;
  onDeeplinkOpen(url);
}
