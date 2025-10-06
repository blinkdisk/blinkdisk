import AutoLaunch from "auto-launch";
import { app } from "electron";

if (app.isPackaged) {
  const autoLauncher = new AutoLaunch({
    name: "BlinkDisk",
    isHidden: true,
    mac: {
      useLaunchAgent: true,
    },
  });

  autoLauncher.enable();
}
