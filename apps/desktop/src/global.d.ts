import type { ElectronAPI } from "@blinkdisk/electron/preload";

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
