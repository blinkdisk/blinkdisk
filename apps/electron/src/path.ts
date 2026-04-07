import { app } from "electron";
import os from "os";
import { join } from "path";

export const platform = (() => {
  switch (process.platform) {
    case "win32":
      return "win";
    case "darwin":
      return "mac";
    case "linux":
      return "linux";
    default:
      return "win";
  }
})();

export const globalConfigDirectory = () =>
  join(app.getPath("appData"), app.isPackaged ? "blinkdisk" : "blinkdisk-dev");

export const globalVaultDirectory = () =>
  join(globalConfigDirectory(), "vaults");

export const globalAccountDirectory = () =>
  join(globalConfigDirectory(), "accounts");

export const corePath = () => {
  if (!app.isPackaged) return join(os.homedir(), "go", "bin", "core");

  return (
    {
      mac: join(process.resourcesPath, "binaries", "kopia"),
      win: join(process.resourcesPath, "binaries", "kopia.exe"),
      linux: join(process.resourcesPath, "binaries", "kopia"),
    } as const
  )[platform];
};
