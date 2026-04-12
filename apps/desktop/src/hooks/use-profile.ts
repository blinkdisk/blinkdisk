import { useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

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
          to: "/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}",
          params: { hostName: hostNameOverride || hostName, userName },
        });
      else
        navigate({
          to: "/{-$accountId}/{-$vaultId}/{-$hostName}",
          params: { hostName: hostNameOverride || hostName },
        });
    },
    [navigate, hostName],
  );

  const changeHostName = useCallback(
    (hostName: string) => {
      navigate({
        to: "/{-$accountId}/{-$vaultId}/{-$hostName}",
        params: { hostName: hostName },
      });
    },
    [navigate],
  );

  const profileFilter = useMemo(() => {
    if (!userName || !hostName) return null;
    return { userName, host: hostName };
  }, [userName, hostName]);

  return {
    userName,
    hostName,
    changeUserName,
    changeHostName,
    profileFilter,
  };
}
