import { useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

declare global {
  interface Window {
    initializedProfile?: string;
  }
}

const localHostName = window.electron.os.hostName();
const localUserName = window.electron.os.userName();

export type ProfileFilter = {
  host: string;
  userName: string;
} | null;

export function useProfile() {
  const navigate = useNavigate();

  const { userName, hostName } = useParams({ strict: false });

  const changeUserName = useCallback(
    (userName: string | undefined, hostNameOverride?: string) => {
      if (userName)
        navigate({
          to: "/app/{-$vaultId}/{-$hostName}/{-$userName}",
          params: { hostName: hostNameOverride || hostName, userName },
        });
      else
        navigate({
          to: "/app/{-$vaultId}/{-$hostName}",
          params: { hostName: hostNameOverride || hostName },
        });
    },
    [navigate, hostName],
  );

  const changeHostName = useCallback(
    (hostName: string) => {
      navigate({
        to: "/app/{-$vaultId}/{-$hostName}",
        params: { hostName: hostName },
      });
    },
    [navigate],
  );

  const remote = useMemo(
    () =>
      (!!userName && userName !== localUserName) ||
      (!!hostName && hostName !== localHostName),
    [userName, hostName],
  );

  const profileFilter = useMemo(() => {
    if (!userName || !hostName) return null;
    return { userName, host: hostName };
  }, [userName, hostName]);

  return {
    userName,
    hostName,
    localUserName,
    localHostName,
    changeUserName,
    changeHostName,
    profileFilter,
    remote,
  };
}
