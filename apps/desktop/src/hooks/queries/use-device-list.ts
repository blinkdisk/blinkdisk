import { useAccountId } from "@desktop/hooks/use-account-id";
import { trpc } from "@desktop/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export type DeviceItem = Awaited<
  ReturnType<typeof trpc.device.list.query>
>[number];

export function useDeviceList() {
  const { accountId } = useAccountId();

  return useQuery({
    queryKey: [accountId, "device", "list"],
    queryFn: async () => {
      return trpc.device.list.query();
    },
    enabled: !!accountId,
  });
}
