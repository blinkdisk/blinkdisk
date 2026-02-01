import { useFolderList } from "@desktop/hooks/queries/core/use-folder-list";
import { useEffect, useRef } from "react";

export function useTaskbarProgress() {
  const { data: folders } = useFolderList();
  const lastProgressRef = useRef<number>(-1);

  useEffect(() => {
    if (!folders) {
      if (lastProgressRef.current !== -1) {
        window.electron.window.setProgressBar(-1);
        lastProgressRef.current = -1;
      }
      return;
    }

    const uploadingFolders = folders.filter(
      (folder) => folder.status === "UPLOADING" && folder.upload,
    );

    if (uploadingFolders.length === 0) {
      if (lastProgressRef.current !== -1) {
        window.electron.window.setProgressBar(-1);
        lastProgressRef.current = -1;
      }
      return;
    }

    let totalProcessed = 0;
    let totalEstimated = 0;

    for (const folder of uploadingFolders) {
      if (folder.upload) {
        totalProcessed += folder.upload.hashedBytes + folder.upload.cachedBytes;
        totalEstimated += folder.upload.estimatedBytes;
      }
    }

    const progress = totalEstimated > 0 ? totalProcessed / totalEstimated : 0;

    const progressDelta = Math.abs(progress - lastProgressRef.current);
    if (progressDelta > 0.005 || lastProgressRef.current === -1) {
      const clampedProgress = Math.min(1, Math.max(0, progress));
      window.electron.window.setProgressBar(clampedProgress);
      lastProgressRef.current = clampedProgress;
    }
  }, [folders]);

  useEffect(() => {
    return () => {
      window.electron.window.setProgressBar(-1);
    };
  }, []);
}
