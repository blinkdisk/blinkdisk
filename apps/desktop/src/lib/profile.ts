import type { VaultProfile } from "@desktop/hooks/queries/core/use-vault-profiles";
import type { ProfileFilter } from "@desktop/hooks/use-profile";

export type DefinedProfileFilter = NonNullable<ProfileFilter>;

export function profileFilterFromParts({
  hostName,
  userName,
}: {
  hostName?: string | null;
  userName?: string | null;
}): DefinedProfileFilter | null {
  if (!hostName || !userName) return null;

  return {
    host: hostName,
    userName,
  };
}

export function isSameProfile(
  a: ProfileFilter | undefined,
  b: ProfileFilter | undefined,
) {
  if (!a || !b) return false;
  return a.host === b.host && a.userName === b.userName;
}

export function getOtherProfiles(
  profiles: VaultProfile[] | null | undefined,
  localProfile: ProfileFilter | undefined,
) {
  if (!profiles || !localProfile) return [];

  return profiles
    .map((profile) => ({
      ...profile,
      userNames: profile.userNames.filter(
        ({ userName }) =>
          !isSameProfile(localProfile, {
            host: profile.hostName,
            userName,
          }),
      ),
    }))
    .filter((profile) => profile.userNames.length > 0);
}

export function getProfileUserNames(
  profiles: VaultProfile[] | null | undefined,
  hostName?: string | null,
) {
  if (!profiles) return [];

  const userNames = new Set<string>();

  for (const profile of profiles) {
    if (hostName && profile.hostName !== hostName) continue;

    for (const { userName } of profile.userNames) {
      userNames.add(userName);
    }
  }

  return Array.from(userNames);
}

export type ProfileFilterSelection = {
  hostName: string | null;
  userName: string | null;
};

export function matchesProfileFilterSelection({
  profile,
  filters,
}: {
  profile: DefinedProfileFilter;
  filters: ProfileFilterSelection;
}) {
  if (filters.hostName && profile.host !== filters.hostName) return false;
  if (filters.userName && profile.userName !== filters.userName) return false;

  return true;
}
