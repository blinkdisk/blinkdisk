import { useVaultStatus } from "@desktop/hooks/queries/use-vault-status";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useVaultId } from "@desktop/hooks/use-vault-id";
import { isDraftPolicyUserName } from "@desktop/lib/policy-target";
import { vaultApi } from "@desktop/lib/vault";
import { useQuery } from "@tanstack/react-query";

export type VaultDevice = {
  hostName: string;
  mock?: boolean;
  users: {
    userName: string;
    mock?: boolean;
  }[];
};

export function useVaultDevices() {
  const { running } = useVaultStatus();
  const { queryKeys } = useQueryKey();
  const { vaultId } = useVaultId();

  return useQuery({
    queryKey: queryKeys.vault.devices(vaultId),
    queryFn: async () => {
      if (!vaultId) return null;

      const res = await vaultApi(vaultId).get<{
        policies: {
          target: {
            host: string;
            userName: string;
            path: string;
          };
        }[];
      }>("/api/v1/policies");

      if (!res.data) return null;

      const devicesByHost = new Map<string, VaultDevice>();

      for (const policy of res.data.policies) {
        const { host, userName } = policy.target;
        if (!host || !userName) continue;
        if (isDraftPolicyUserName(userName)) continue;

        let device = devicesByHost.get(host);

        if (!device) {
          device = {
            hostName: host,
            users: [],
          };
          devicesByHost.set(host, device);
        }

        if (device.users.some((user) => user.userName === userName)) continue;
        device.users.push({ userName });
      }

      const localHostName = window.electron.os.hostName(vaultId);
      const localUserName = window.electron.os.userName(vaultId);
      const localDevice = devicesByHost.get(localHostName);

      if (!localDevice) {
        devicesByHost.set(localHostName, {
          hostName: localHostName,
          mock: true,
          users: [
            {
              userName: localUserName,
              mock: true,
            },
          ],
        });
      } else {
        if (!localDevice.users.some((user) => user.userName === localUserName))
          localDevice.users.push({
            userName: localUserName,
            mock: true,
          });
      }

      return Array.from(devicesByHost.values());
    },
    enabled: !!vaultId && running,
  });
}
