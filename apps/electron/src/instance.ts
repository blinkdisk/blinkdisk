import { onDeeplinkOpen } from "@electron/deeplink";
import { focusWindow } from "@electron/window";
import { app } from "electron";

const firstInstance = app.requestSingleInstanceLock();

if (!firstInstance) {
  app.quit();
} else {
  app.on("second-instance", (_1, argv, _2, url) => {
    focusWindow();

    if (!url) {
      const maybeURL = argv.at(-1);
      if (typeof maybeURL === "string" && maybeURL.trim() !== "") {
        try {
          url = new URL(maybeURL).toString();
        } catch {
          // Not a url, ignore
        }
      }
    }

    if (process.platform === "darwin" || typeof url !== "string") return;

    onDeeplinkOpen((url as string).toString());
  });
}
