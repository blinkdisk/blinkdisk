import { useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

export type Profile = {
  deviceName: string;
  userName: string;
};

export type SelectedProfile = Profile | null;

export function useProfile() {
  const navigate = useNavigate();

  const { accountId, vaultId, userName, hostName } = useParams({
    strict: false,
  });

  const changeUserName = useCallback(
    (userName: string | undefined, hostNameOverride?: string) => {
      if (!accountId || !vaultId) return;

      const nextHostName = hostNameOverride || hostName;
      if (!nextHostName) return;

      if (userName)
        navigate({
          to: "/$accountId/$vaultId/$hostName/$userName",
          params: { accountId, vaultId, hostName: nextHostName, userName },
        });
      else
        navigate({
          to: "/$accountId/$vaultId/$hostName",
          params: { accountId, vaultId, hostName: nextHostName },
        });
    },
    [navigate, accountId, vaultId, hostName],
  );

  const changeHostName = useCallback(
    (hostName: string) => {
      if (!accountId || !vaultId) return;

      navigate({
        to: "/$accountId/$vaultId/$hostName",
        params: { accountId, vaultId, hostName },
      });
    },
    [navigate, accountId, vaultId],
  );

  const profile = useMemo<SelectedProfile>(() => {
    if (!userName || !hostName) return null;
    return { deviceName: hostName, userName };
  }, [userName, hostName]);

  return {
    userName,
    hostName,
    changeUserName,
    changeHostName,
    profile,
  };
}
