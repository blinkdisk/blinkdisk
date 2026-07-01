import { parseSourceId } from "@desktop/lib/source";
import { useParams } from "@tanstack/react-router";

export type Profile = {
  deviceName: string;
  userName: string;
};

export type SelectedProfile = Profile | null;

export function useProfile() {
  const { sourceId } = useParams({
    strict: false,
  });

  const sourceIdParts = sourceId ? parseSourceId(sourceId) : null;
  const userName = sourceIdParts?.user;
  const hostName = sourceIdParts?.device;

  const profile = (() => {
    if (userName === undefined || hostName === undefined) return null;
    return { deviceName: hostName, userName };
  })();

  return {
    userName,
    hostName,
    profile,
  };
}
