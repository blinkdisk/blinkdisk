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

      const devices: VaultDevice[] = [];

      for (const policy of res.data.policies) {
        if (!policy.target.host || !policy.target.userName) continue;
        if (isDraftPolicyUserName(policy.target.userName)) continue;

        const index = devices.findIndex(
          (device) => device.hostName === policy.target.host,
        );

        if (index !== -1) {
          if (
            devices[index]?.users.find(
              ({ userName }) => userName === policy.target.userName,
            )
          )
            continue;
          devices[index]?.users.push({ userName: policy.target.userName });
        } else {
          devices.push({
            hostName: policy.target.host,
            users: [
              {
                userName: policy.target.userName,
              },
            ],
          });
        }
      }

      const localHostName = window.electron.os.hostName(vaultId);
      const localUserName = window.electron.os.userName(vaultId);

      const localDeviceIndex = devices.findIndex(
        (device) => device.hostName === localHostName,
      );

      if (localDeviceIndex === -1)
        devices.push({
          hostName: localHostName,
          mock: true,
          users: [
            {
              userName: localUserName,
              mock: true,
            },
          ],
        });
      else {
        if (
          !devices[localDeviceIndex]?.users.find(
            ({ userName }) => userName === localUserName,
          )
        )
          devices[localDeviceIndex]?.users.push({
            userName: localUserName,
            mock: true,
          });
      }

      return devices;
    },
    enabled: !!vaultId && running,
  });
}
