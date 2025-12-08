import { useQueryKey } from "@desktop/hooks/use-query-key";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import { useDevice } from "../use-device";

export type DeviceProfileItem = Awaited<
  ReturnType<typeof trpc.profile.list.query>
>[number];

export function useDeviceProfileList() {
  const { queryKeys, accountId } = useQueryKey();
  const { deviceId } = useDevice();

  return useQuery({
    queryKey: queryKeys.device.profiles(deviceId),
    queryFn: async () => {
      return trpc.profile.list.query({ deviceId });
    },
    enabled: !!accountId,
  });
}
