import { parseSourceId } from "@desktop/lib/source";
import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";

export type Profile = {
  deviceName: string;
  userName: string;
};

export type SelectedProfile = Profile | null;

export function useProfile() {
  const { sourceId } = useParams({
    strict: false,
  });

  const sourceIdParts = useMemo(
    () => (sourceId ? parseSourceId(sourceId) : null),
    [sourceId],
  );
  const userName = sourceIdParts?.user;
  const hostName = sourceIdParts?.device;

  const profile = useMemo<SelectedProfile>(() => {
    if (userName === undefined || hostName === undefined) return null;
    return { deviceName: hostName, userName };
  }, [userName, hostName]);

  return {
    userName,
    hostName,
    profile,
  };
}
