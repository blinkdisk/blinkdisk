import { useSourceList } from "@desktop/hooks/queries/core/use-source-list";
import { useLocalProfile } from "@desktop/hooks/use-local-profile";
import { useProfile } from "@desktop/hooks/use-profile";
import { profileFromParts } from "@desktop/lib/profile";
import { useEffect, useRef } from "react";

export function useTaskbarProgress() {
  const { profile: routeProfile } = useProfile();
  const { localHostName, localUserName } = useLocalProfile();
  const localProfile = profileFromParts({
    hostName: localHostName,
    userName: localUserName,
  });
  const { data: sources } = useSourceList({
    profile: routeProfile ?? localProfile,
  });
  const lastProgressRef = useRef<number>(-1);

  useEffect(() => {
    if (!sources) {
      if (lastProgressRef.current !== -1) {
        window.electron.window.setProgressBar(-1);
        lastProgressRef.current = -1;
      }
      return;
    }

    const uploadingSources = sources.filter(
      (source) => source.status === "UPLOADING" && source.upload,
    );

    if (uploadingSources.length === 0) {
      if (lastProgressRef.current !== -1) {
        window.electron.window.setProgressBar(-1);
        lastProgressRef.current = -1;
      }
      return;
    }

    let totalProcessed = 0;
    let totalEstimated = 0;

    for (const source of uploadingSources) {
      if (source.upload?.estimatedBytes) {
        totalProcessed += source.upload.hashedBytes + source.upload.cachedBytes;
        totalEstimated += source.upload.estimatedBytes;
      }
    }

    const progress = totalEstimated > 0 ? totalProcessed / totalEstimated : 0;

    const progressDelta = Math.abs(progress - lastProgressRef.current);
    if (progressDelta > 0.005 || lastProgressRef.current === -1) {
      const clampedProgress = Math.min(1, Math.max(0, progress));
      window.electron.window.setProgressBar(clampedProgress);
      lastProgressRef.current = clampedProgress;
    }
  }, [sources]);

  useEffect(() => {
    return () => {
      window.electron.window.setProgressBar(-1);
    };
  }, []);
}
