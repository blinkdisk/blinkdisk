import { focusWindow, sendWindow } from "@electron/window";
import { app } from "electron";
import { resolve } from "path";

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("blinkdisk", process.execPath, [
      resolve(process.argv[1] as string),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient("blinkdisk");
}

export function onDeeplinkOpen(rawUrl: string) {
  const url = new URL(rawUrl);
  if (url.protocol !== "blinkdisk:") return;

  sendWindow("deeplink.open", {
    event: url.host,
  });
}

app.on("open-url", (_, url) => {
  focusWindow();
  onDeeplinkOpen(url);
});
