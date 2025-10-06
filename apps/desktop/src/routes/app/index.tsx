import { VaultHome } from "@desktop/components/vaults/home";
import { useDevice } from "@desktop/hooks/use-device";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/app/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { localDeviceId } = useDevice();

  const navigate = Route.useNavigate();

  useEffect(() => {
    navigate({
      to: "/app/{-$deviceId}",
      params: {
        deviceId: localDeviceId || "-",
      },
      replace: true,
    });
  }, [navigate, localDeviceId]);

  return <VaultHome />;
}
