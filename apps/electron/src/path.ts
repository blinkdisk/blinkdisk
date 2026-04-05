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

export const globalConfigtDirectory = () =>
  join(app.getPath("appData"), "blinkdisk");

export const globalVaultDirectory = () =>
  join(globalConfigtDirectory(), "vaults");

export const globalAccountDirectory = () =>
  join(globalConfigtDirectory(), "accounts");

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
