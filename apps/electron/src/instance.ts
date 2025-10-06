import { onDeeplinkOpen } from "@electron/deeplink";
import { focusWindow } from "@electron/window";
import { app } from "electron";

const firstInstance = app.requestSingleInstanceLock();

if (!firstInstance) {
  app.quit();
} else {
  app.on("second-instance", (_, argv) => {
    focusWindow();

    const url = argv.at(-1);
    if (!url || !url.startsWith("blinkdisk://")) return;
    onDeeplinkOpen(url);
  });
}
