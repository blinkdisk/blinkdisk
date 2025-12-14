import { useAppStorage } from "@desktop/hooks/use-app-storage";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { authClient } from "@desktop/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

export function useAccount(options?: { enabled: boolean }) {
  const { queryKeys } = useQueryKey();
  const navigate = useNavigate();

  const [, setAuthenticated] = useAppStorage("authenticated", false);

  return useQuery({
    queryKey: queryKeys.account.detail(),
    queryFn: async () => {
      const { data, error } = await authClient.getSession();

      if (error) throw error;
      if (data === null) {
        setAuthenticated(false);
        await navigate({ to: "/auth/login" });
      }

      return data;
    },
    enabled: options?.enabled,
  });
}
