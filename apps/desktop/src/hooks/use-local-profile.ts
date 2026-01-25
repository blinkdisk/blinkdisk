import { useMemo } from "react";
import { useProfile } from "./use-profile";
import { useVaultId } from "./use-vault-id";

export function useLocalProfile() {
  const { vaultId } = useVaultId();

  const { userName, hostName } = useProfile();

  const { localHostName, localUserName } = useMemo(() => {
    if (!vaultId) {
      return {
        localHostName: null,
        localUserName: null,
      };
    }

    return {
      localHostName: window.electron.os.hostName(vaultId),
      localUserName: window.electron.os.userName(vaultId),
    };
  }, [vaultId]);

  const remote = useMemo(() => {
    if (!localUserName || !localHostName) return null;

    return (
      (!!userName && userName !== localUserName) ||
      (!!hostName && hostName !== localHostName)
    );
  }, [userName, hostName, localUserName, localHostName]);

  return {
    localUserName,
    localHostName,
    remote,
  };
}
