import type { authClient } from "@blinkdisk/electron/auth";
import type { ElectronAPI } from "@blinkdisk/electron/preload";

declare global {
  type Bridges = typeof authClient.$Infer.Bridges;
  interface Window extends Bridges {
    electron: ElectronAPI;
  }
}
