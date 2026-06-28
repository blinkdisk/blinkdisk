import { parseFolderId } from "@desktop/lib/folder";
import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";

export type Profile = {
  deviceName: string;
  userName: string;
};

export type SelectedProfile = Profile | null;

export function useProfile() {
  const { folderId } = useParams({
    strict: false,
  });

  const folderIdParts = useMemo(
    () => (folderId ? parseFolderId(folderId) : null),
    [folderId],
  );
  const userName = folderIdParts?.user;
  const hostName = folderIdParts?.device;

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
