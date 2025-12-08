import { useQueryKey } from "@desktop/hooks/use-query-key";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export type DeviceItem = Awaited<
  ReturnType<typeof trpc.device.list.query>
>[number];

export function useDeviceList() {
  const { queryKeys, accountId } = useQueryKey();

  return useQuery({
    queryKey: queryKeys.device.list(),
    queryFn: async () => {
      return trpc.device.list.query();
    },
    enabled: !!accountId,
  });
}
