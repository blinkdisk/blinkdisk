import { useAccountStorage } from "@desktop/hooks/use-account-storage";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

declare global {
  interface Window {
    initializedProfile?: string;
  }
}

export function useProfile() {
  const navigate = useNavigate();

  const [localProfileId] = useAccountStorage("profileId");
  const { deviceId, profileId } = useParams({ strict: false });

  const changeProfile = useCallback(
    (profileId: string | undefined, deviceIdOverride?: string) => {
      if (profileId)
        navigate({
          to: "/app/{-$deviceId}/{-$profileId}",
          params: { deviceId: deviceIdOverride || deviceId || "-", profileId },
        });
      else
        navigate({
          to: "/app/{-$deviceId}",
          params: { deviceId: deviceIdOverride || deviceId || "-" },
        });
    },
    [deviceId, navigate],
  );

  const readOnly = useMemo(
    () => (profileId && localProfileId ? profileId !== localProfileId : false),
    [profileId, localProfileId],
  );

  return { profileId, changeProfile, localProfileId, readOnly };
}
