import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";

export type Profile = {
  deviceName: string;
  userName: string;
};

export type SelectedProfile = Profile | null;

export function useProfile() {
  const { userName, hostName } = useParams({
    strict: false,
  });

  const profile = useMemo<SelectedProfile>(() => {
    if (!userName || !hostName) return null;
    return { deviceName: hostName, userName };
  }, [userName, hostName]);

  return {
    userName,
    hostName,
    profile,
  };
}
