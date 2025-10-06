import { useProfileList } from "@desktop/hooks/queries/use-profile-list";
import { useAccountStorage } from "@desktop/hooks/use-account-storage";
import { useProfile } from "@desktop/hooks/use-profile";
import { useParams } from "@tanstack/react-router";
import { useCallback } from "react";

declare global {
  interface Window {
    initializedDevice?: string;
  }
}

export function useDevice() {
  const { data: profiles } = useProfileList();
  const { changeProfile } = useProfile();

  const [localDeviceId] = useAccountStorage("deviceId");
  const [localProfileId] = useAccountStorage("profileId");
  const { deviceId } = useParams({ strict: false });

  const changeDevice = useCallback(
    (deviceId: string) => {
      const localProfile = profiles?.find(
        (p) => p.deviceId === deviceId && p.id === localProfileId,
      );

      const profile = profiles?.find((p) => p.deviceId === deviceId);

      if (localProfile) changeProfile(localProfile.id, deviceId);
      else if (profile) changeProfile(profile.id, deviceId);
      else changeProfile(undefined, deviceId);
    },
    [profiles, changeProfile, localProfileId],
  );

  return { deviceId, changeDevice, localDeviceId };
}
