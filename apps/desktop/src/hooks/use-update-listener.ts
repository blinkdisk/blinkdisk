import type { UpdateStatus } from "@blinkdisk/electron/updater";
import {
  type UpdateDialogTestState,
  useUpdateDialog,
} from "@desktop/hooks/state/use-update-dialog";
import { useEffect } from "react";

declare global {
  interface Window {
    testUpdateDialog?: (state?: UpdateDialogTestState) => void;
  }
}

function getTestUpdateStatus(state: UpdateDialogTestState): UpdateStatus {
  return {
    available: state !== "hidden",
    details:
      state === "hidden"
        ? null
        : {
            files: [],
            path: "",
            releaseDate: new Date().toISOString(),
            sha512: "",
            version: "v1.0.0",
          },
    downloaded: state === "downloaded",
    progress:
      state === "downloading"
        ? {
            bytesPerSecond: 1_200_000,
            delta: 600_000,
            percent: 42,
            total: 100_000_000,
            transferred: 42_000_000,
          }
        : null,
    errored: state === "error",
  };
}

export function useUpdateListener() {
  const { setStatus } = useUpdateDialog();

  useEffect(() => {
    window.electron.update.status().then(setStatus);

    return window.electron.update.change((payload) => {
      setStatus(payload);
    });
  }, [setStatus]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    window.testUpdateDialog = (state = "downloading") => {
      setStatus(getTestUpdateStatus(state));
    };

    return () => {
      delete window.testUpdateDialog;
    };
  }, [setStatus]);
}
