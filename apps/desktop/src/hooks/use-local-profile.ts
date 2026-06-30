import { useProfile } from "@desktop/hooks/use-profile";
import { useVaultId } from "@desktop/hooks/use-vault-id";

export function useLocalProfile() {
  const { vaultId } = useVaultId();

  const { userName, hostName } = useProfile();

  const { localHostName, localUserName } = (() => {
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
  })();

  const remote = (() => {
    if (!localUserName || !localHostName) return null;

    return (
      (!!userName && userName !== localUserName) ||
      (!!hostName && hostName !== localHostName)
    );
  })();

  return {
    localUserName,
    localHostName,
    remote,
  };
}
