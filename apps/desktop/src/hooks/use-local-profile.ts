import { DEMO_HOST_NAME, DEMO_USER_NAME } from "@blinkdisk/constants/demo";
import { isDemoMode } from "@desktop/lib/demo";
import { useProfile } from "@desktop/hooks/use-profile";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { useMemo } from "react";

export function useLocalProfile() {
  const { vaultId } = useVaultId();

  const { userName, hostName } = useProfile();

  const { localHostName, localUserName } = useMemo(() => {
    if (isDemoMode) {
      return {
        localHostName: DEMO_HOST_NAME,
        localUserName: DEMO_USER_NAME,
      };
    }

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
