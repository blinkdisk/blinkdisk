import { useAccountId } from "@desktop/hooks/use-account-id";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import { useDevice } from "../use-device";

export type DeviceProfileItem = Awaited<
  ReturnType<typeof trpc.profile.list.query>
>[number];

export function useDeviceProfileList() {
  const { accountId } = useAccountId();
  const { deviceId } = useDevice();

  return useQuery({
    queryKey: [accountId, "profile", "list", deviceId],
    queryFn: async () => {
      return trpc.profile.list.query({ deviceId });
    },
    enabled: !!accountId,
  });
}
