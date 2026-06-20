import { VaultOverview } from "@desktop/components/vaults/overview";
import { useVaultDevices } from "@desktop/hooks/queries/core/use-vault-devices";
import { useLocalProfile } from "@desktop/hooks/use-local-profile";
import { useProfile } from "@desktop/hooks/use-profile";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute(
  "/{-$accountId}/{-$vaultId}/{-$hostName}/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: devices } = useVaultDevices();

  const { localUserName } = useLocalProfile();
  const { hostName } = useProfile();

  const navigate = Route.useNavigate();

  useEffect(() => {
    if (!devices || !hostName || !localUserName) return;

    const device = devices.find((device) => device.hostName === hostName);

    if (!device)
      navigate({
        to: "/{-$accountId}/{-$vaultId}",
        replace: true,
      });
    else {
      const localUser = device.users.find(
        ({ userName }) => userName === localUserName,
      );

      navigate({
        to: "/{-$accountId}/{-$vaultId}/{-$hostName}/{-$userName}",
        params: (params) => ({
          ...params,
          userName: localUser
            ? localUserName
            : device.users[0]?.userName || localUserName,
        }),
        replace: true,
      });
    }
  }, [devices, navigate, localUserName, hostName]);

  return <VaultOverview />;
}
