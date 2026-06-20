import type { VaultDevice } from "@desktop/hooks/queries/core/use-vault-devices";
import type { Profile, SelectedProfile } from "@desktop/hooks/use-profile";

export type DefinedProfile = Profile;

export function profileFromParts({
  hostName,
  userName,
}: {
  hostName?: string | null;
  userName?: string | null;
}): SelectedProfile {
  if (!hostName || !userName) return null;

  return {
    deviceName: hostName,
    userName,
  };
}

export function isSameProfile(
  a: SelectedProfile | undefined,
  b: SelectedProfile | undefined,
) {
  if (!a || !b) return false;
  return a.deviceName === b.deviceName && a.userName === b.userName;
}

export function getOtherProfiles(
  devices: VaultDevice[] | null | undefined,
  localProfile: SelectedProfile | undefined,
) {
  if (!devices || !localProfile) return [];

  return devices
    .map((device) => ({
      ...device,
      users: device.users.filter(
        ({ userName }) =>
          !isSameProfile(localProfile, {
            deviceName: device.hostName,
            userName,
          }),
      ),
    }))
    .filter((device) => device.users.length > 0);
}

export function getProfileUserNames(
  devices: VaultDevice[] | null | undefined,
  deviceName?: string | null,
) {
  if (!devices) return [];

  const userNames = new Set<string>();

  for (const device of devices) {
    if (deviceName && device.hostName !== deviceName) continue;

    for (const { userName } of device.users) {
      userNames.add(userName);
    }
  }

  return Array.from(userNames);
}

export type ProfileListFilters = {
  deviceName: string | null;
  userName: string | null;
};

export function matchesProfileListFilters({
  profile,
  filters,
}: {
  profile: DefinedProfile;
  filters: ProfileListFilters;
}) {
  if (filters.deviceName && profile.deviceName !== filters.deviceName)
    return false;
  if (filters.userName && profile.userName !== filters.userName) return false;

  return true;
}

export function kopiaParamsFromProfile(profile: Profile) {
  return {
    host: profile.deviceName,
    userName: profile.userName,
  };
}
