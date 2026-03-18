import { useAppStorage } from "@desktop/hooks/use-app-storage";
import { useQueryKey } from "@desktop/hooks/use-query-key";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

export function useAccount(options?: { enabled: boolean }) {
  const { queryKeys } = useQueryKey();
  const navigate = useNavigate();

  const [, setAuthenticated] = useAppStorage("authenticated", false);

  return useQuery({
    queryKey: queryKeys.account.detail(),
    queryFn: async () => {
      const { data, error } = await window.electron.auth.session.get();

      if (error) throw error;
      if (data === null) {
        setAuthenticated(false);
        await navigate({ to: "/auth" });
      }

      return data;
    },
    enabled: options?.enabled,
  });
}
